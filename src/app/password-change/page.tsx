"use client";
import {
  CheckCircledIcon,
  CircleBackslashIcon,
  InfoCircledIcon,
  LockClosedIcon,
  LockOpen1Icon,
  MixIcon,
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
import { asn1, pki, util } from "node-forge";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import Dropzone from "~/components/dropzone";
import { downloadFile } from "~/utils/files";

const PasswordChange = () => {
  const [oldPassphrase, setOldPassphrase] = useState("");
  const [passphrase, setPassphrase] = useState("");

  const keyDropzone = useDropzone({
    accept: {
      "application/pkcs8": [".key"],
    },
  });

  const isKey = keyDropzone.acceptedFiles.length > 0;

  const encryptedPrivateKey = useMemo(() => {
    if (keyDropzone.acceptedFiles.length === 0) return;
    return keyDropzone.acceptedFiles[0]
      .arrayBuffer()
      .then((arrayBuffer) => util.createBuffer(arrayBuffer))
      .then((key) => asn1.fromDer(key));
  }, [keyDropzone.acceptedFiles]);

  const changePassword = async () => {
    if (!encryptedPrivateKey) return;

    const awaitedEncryptedPrivateKey = await encryptedPrivateKey;
    try {
      const encryptedPrivateKeyPEM = pki.decryptPrivateKeyInfo(
        awaitedEncryptedPrivateKey,
        oldPassphrase
      );
      const reencryptedPrivateKey = pki.encryptPrivateKeyInfo(
        encryptedPrivateKeyPEM,
        passphrase
      );

      const pem = pki.privateKeyInfoToPem(reencryptedPrivateKey);
      const pemBase64 = util.encode64(pem);

      downloadFile(
        `data:application/pkcs8;base64,${pemBase64}`,
        `${keyDropzone.acceptedFiles[0].name}`
      );
    } catch (err) {
      console.log(err);
      return alert("Contraseña incorrecta. La contraseña es inválida");
    }
  };

  return (
    <>
      <Heading size="7">Cambia la contraseña de tu e.firma</Heading>
      <Text>
        Importa tu llave (<Code>.key</Code>) para cambiar tu contraseña por una
        más segura.
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
            {isKey ? (
              <CheckCircledIcon color="green" width="20" height="20" />
            ) : (
              <CircleBackslashIcon color="gray" width="20" height="20" />
            )}
            <Heading ml="2" size="4">
              Paso 1. Importa tu llave (<Code>.key</Code>)
            </Heading>
          </Flex>
          {keyDropzone.acceptedFiles.length === 0 ? (
            <Dropzone
              style={{
                minHeight: "400px",
              }}
              {...keyDropzone}
              text="Coloca aquí tu PDF"
              my="3"
              width="100%"
              icon={<LockOpen1Icon width="30" height="30" />}
            />
          ) : (
            <Card my="2">
              <Flex align="center" p="2">
                <LockOpen1Icon width="30" height="30" />
                <Text ml="2">{keyDropzone.acceptedFiles[0].name}</Text>
              </Flex>
            </Card>
          )}
        </Flex>
        <Flex direction="column" width="100%">
          <Flex align="center" mt="4">
            <Heading ml="2" size="4">
              Paso 2. Ingresa tu nueva contraseña
            </Heading>
          </Flex>

          <TextField.Root mt="2">
            <TextField.Slot>
              <LockClosedIcon height="16" width="16" />
            </TextField.Slot>
            <TextField.Input
              onChange={(e) => setOldPassphrase(e.target.value)}
              value={oldPassphrase}
              size="2"
              placeholder="Contraseña anterior"
            />
          </TextField.Root>
          <TextField.Root mt="2">
            <TextField.Slot>
              <LockClosedIcon height="16" width="16" />
            </TextField.Slot>
            <TextField.Input
              onChange={(e) => setPassphrase(e.target.value)}
              value={passphrase}
              type="password"
              size="2"
              placeholder="Nueva contraseña"
            />
          </TextField.Root>
          <Button
            disabled={!isKey || !oldPassphrase || !passphrase}
            size="3"
            mt="2"
            onClick={changePassword}
          >
            Cambiar contraseña
            <MixIcon />
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

export default PasswordChange;
