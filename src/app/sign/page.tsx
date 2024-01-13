"use client";
import {
  CheckCircledIcon,
  CheckIcon,
  CircleBackslashIcon,
  FileIcon,
  InfoCircledIcon,
  LockClosedIcon,
  LockOpen1Icon,
  Pencil2Icon,
  ReaderIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  Button,
  Callout,
  Card,
  Code,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import Dropzone from "~/components/dropzone";
import { useDropzone } from "react-dropzone";
import PDFDocument from "~/components/pdf";
import { util, asn1, pki, md } from "node-forge";
import { useMemo, useState } from "react";
import Certificate, {
  ExpiredCertificateError,
  InvalidCertificateError,
} from "~/utils/certificate";
import Signer, { MismatchedPublicKeyError } from "~/utils/signer";
import { toMD } from "./utils";
import JSZip from "jszip";

const downloadFile = (url: string, name: string) => {
  const link = document.createElement("a");
  link.download = name;
  link.href = url;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Sign = () => {
  const [passphrase, setPassphrase] = useState("");

  const pdfDropzone = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const certificateDropzone = useDropzone({
    accept: {
      "application/x-x509-ca-cert": [".cer"],
    },
  });

  const keyDropzone = useDropzone({
    accept: {
      "application/pkcs8": [".key"],
    },
  });

  const certificate = useMemo(() => {
    if (certificateDropzone.acceptedFiles.length === 0) return;
    return certificateDropzone.acceptedFiles[0]
      .arrayBuffer()
      .then((arrayBuffer) => util.createBuffer(arrayBuffer))
      .then((cert) => asn1.fromDer(cert))
      .then((certAsn1) => pki.certificateFromAsn1(certAsn1));
  }, [certificateDropzone.acceptedFiles]);

  const encryptedPrivateKey = useMemo(() => {
    if (keyDropzone.acceptedFiles.length === 0) return;
    return keyDropzone.acceptedFiles[0]
      .arrayBuffer()
      .then((arrayBuffer) => util.createBuffer(arrayBuffer))
      .then((key) => asn1.fromDer(key));
  }, [keyDropzone.acceptedFiles]);

  const isPDF = pdfDropzone.acceptedFiles.length > 0;
  const isCertificate = certificateDropzone.acceptedFiles.length > 0;
  const isKey = keyDropzone.acceptedFiles.length > 0;

  const sign = async () => {
    try {
      if (!certificate) return;
      if (!encryptedPrivateKey) return;

      const awaitedCertificate = await certificate;
      const awaitedEncryptedPrivateKey = await encryptedPrivateKey;

      const certificateHelper = new Certificate(awaitedCertificate);
      const signer = new Signer(certificateHelper, awaitedEncryptedPrivateKey);

      const buff = util.createBuffer(
        await pdfDropzone.acceptedFiles[0].arrayBuffer()
      );

      const fileContent = buff.getBytes();
      const { signature, digest } = signer.sign(fileContent, passphrase);

      const hexDigest = util.bytesToHex(digest);
      const base64Signature = util.encode64(signature);

      const zip = new JSZip();
      zip.file("certificate.cer", certificateHelper.PEM);
      zip.file("signature.txt", base64Signature);
      zip.file("digest.txt", hexDigest);
      zip.file(
        "README.md",
        toMD({
          digest: hexDigest,
          certificate: certificateHelper,
          signature: base64Signature,
        })
      );
      const content = await zip.generateAsync({ type: "base64" });

      downloadFile(
        `data:application/zip;base64,${content}`,
        `firma-${certificateHelper.subject.serialNumber}-${base64Signature}.zip`
      );
    } catch (err) {
      if (err instanceof MismatchedPublicKeyError) {
        return alert(
          "Certificado inválido. La llave privada no corresponde al certificado"
        );
      } else if (err instanceof ExpiredCertificateError) {
        return alert("Certificado expirado. El certificado está expirado");
      } else if (err instanceof InvalidCertificateError) {
        return alert("Certificado inválido. El certificado no es válido");
      } else {
        return alert("Contraseña incorrecta. La contraseña es inválida");
      }
    }
  };

  return (
    <>
      <Heading size="7">Firma un PDF</Heading>
      <Text>
        Utiliza to Certificado (<Code>.cer</Code>) y llave (<Code>.key</Code>){" "}
        para firmar documentos utilizando tu contraseña.
      </Text>
      <Callout.Root mt="2">
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          Te recomendamos desconectarte de internet antes de firmar importar tus
          archivos. Esto te garantiza que Plumaa no recolecta información de tu
          certificado o llave privada.
        </Callout.Text>
      </Callout.Root>
      <Flex gap="5">
        <Flex direction="column" width="100%">
          <Flex align="center" mt="4">
            {isPDF ? (
              <CheckCircledIcon color="green" width="20" height="20" />
            ) : (
              <CircleBackslashIcon color="gray" width="20" height="20" />
            )}
            <Heading ml="2" size="4">
              Paso 1. Importa tu PDF
            </Heading>
          </Flex>
          {pdfDropzone.acceptedFiles.length === 0 ? (
            <Dropzone
              style={{
                minHeight: "400px",
              }}
              {...pdfDropzone}
              text="Coloca aquí tu PDF"
              my="3"
              width="100%"
              icon={<ReaderIcon width="30" height="30" />}
            />
          ) : (
            <PDFDocument
              file={pdfDropzone.acceptedFiles[0]}
              page={{
                height: 800,
              }}
            />
          )}
        </Flex>
        <Flex direction="column" width="100%">
          <Flex align="center" mt="4">
            {isCertificate ? (
              <CheckCircledIcon color="green" width="20" height="20" />
            ) : (
              <CircleBackslashIcon color="gray" width="20" height="20" />
            )}
            <Heading ml="2" size="4">
              Paso 2. Importa tu certificado y llave privada
            </Heading>
          </Flex>
          {certificateDropzone.acceptedFiles.length === 0 ? (
            <Dropzone
              {...certificateDropzone}
              my="3"
              width="100%"
              text="Coloca aquí to certificado (.cer)"
            />
          ) : (
            <Card my="2">
              <Flex align="center" p="2">
                <FileIcon width="30" height="30" />
                <Text ml="2">{certificateDropzone.acceptedFiles[0].name}</Text>
              </Flex>
            </Card>
          )}
          {keyDropzone.acceptedFiles.length === 0 ? (
            <Dropzone
              {...keyDropzone}
              my="3"
              width="100%"
              text="Coloca aquí tu llave (.key)"
            />
          ) : (
            <Card my="2">
              <Flex align="center" p="2">
                <LockOpen1Icon width="30" height="30" />
                <Text ml="2">{keyDropzone.acceptedFiles[0].name}</Text>
              </Flex>
            </Card>
          )}
          <Flex align="center" mt="4">
            {isCertificate ? (
              <CheckCircledIcon color="green" width="20" height="20" />
            ) : (
              <CircleBackslashIcon color="gray" width="20" height="20" />
            )}
            <Heading ml="2" size="4">
              Paso 3. Escribe tu contraseña
            </Heading>
          </Flex>

          <TextField.Root mt="2">
            <TextField.Slot>
              <LockClosedIcon height="16" width="16" />
            </TextField.Slot>
            <TextField.Input
              onChange={(e) => setPassphrase(e.target.value)}
              value={passphrase}
              type="password"
              size="2"
              placeholder="Contraseña"
            />
          </TextField.Root>
          <Button
            disabled={!isPDF || !isCertificate || !isKey || !passphrase}
            size="3"
            mt="2"
            onClick={sign}
          >
            Firma
            <Pencil2Icon />
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

export default Sign;
