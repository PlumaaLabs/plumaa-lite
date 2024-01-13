import Certificate from "~/utils/certificate";

const toMD = ({
  digest,
  certificate,
  signature,
}: {
  digest: string;
  certificate: Certificate;
  signature: string;
}) => `
### Firma Electrónica

- Algoritmo: RSA SHA256
- Digest del documento: ${digest}

### Certificado

- No. Serie: ${certificate.underlying.serialNumber}
- Emisor: ${certificate.issuer.commonName}
- Organización: ${certificate.issuer.organizationName}
- Validez: 
  - No antes del ${certificate.underlying.validity.notBefore}
  - No despues del ${certificate.underlying.validity.notAfter}

### Firmante

- Titular: ${certificate.subject.commonName}
- CURP: ${certificate.subject.serialNumber}
- Email: ${certificate.subject.emailAddress}

#### Firma

\`# Fecha: ${new Date().toISOString()}\`
\`${signature}\`

_Esta es la representación visual de la firma electrónica del documento digital con digest: ${digest}._
_La verificación de la firma electrónica puede ser realizada following the Publick Key Cryptography Standards #1 (PKCS1) v2.2. in RFC8017 [Section 8.2.2](https://datatracker.ietf.org/doc/html/rfc8017#section-8.2.2)_
`;

export { toMD };
