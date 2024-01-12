"use client";
import {
  InfoCircledIcon,
  LockClosedIcon,
  Pencil2Icon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import {
  Button,
  Callout,
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

      const certificateHelper = new Certificate(await certificate);
      const signer = new Signer(certificateHelper, await encryptedPrivateKey);

      const buff = util.createBuffer(
        await pdfDropzone.acceptedFiles[0].arrayBuffer()
      );

      const fileContent = buff.getBytes();
      const signature = signer.sign(fileContent, passphrase);

      console.log(signature);
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
          <Heading size="4" mt="4">
            Paso 1. Importa tu PDF
          </Heading>
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
          <Heading size="4" mt="4">
            Paso 2. Importa tu certificado y llave privada
          </Heading>
          {certificateDropzone.acceptedFiles.length === 0 ? (
            <Dropzone
              {...certificateDropzone}
              my="3"
              width="100%"
              text="Coloca aquí to certificado (.cer)"
            />
          ) : (
            <Text>
              Certificado: {certificateDropzone.acceptedFiles[0].name}
            </Text>
          )}
          {keyDropzone.acceptedFiles.length === 0 ? (
            <Dropzone
              {...keyDropzone}
              my="3"
              width="100%"
              text="Coloca aquí tu llave (.key)"
            />
          ) : (
            <Text>Llave: {keyDropzone.acceptedFiles[0].name}</Text>
          )}
          <Heading size="4" mt="4">
            Paso 3. Escribe tu contraseña
          </Heading>
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
          <Heading size="4" mt="4">
            Paso 4. Firma
          </Heading>
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
