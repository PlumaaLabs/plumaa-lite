import { pki } from "node-forge";

class ExpiredCertificateError extends Error {}

class InvalidCertificateError extends Error {}

interface Entity {
  commonName: string;
  organizationName: string;
  localityName?: string;
  emailAddress: string;
  countryName: string;
}

interface Issuer extends Entity {
  organizationalUnitName: string;
  streetAddress: string;
  postalCode: string;
  stateOrProvinceName: string;
  unstructuredName: string;
}

interface Subject extends Entity {
  id: string;
  serialNumber: string;
}

class Certificate {
  constructor(public readonly underlying: pki.Certificate) {
    this._validate();
  }

  private _validate() {
    const { validity } = this.underlying;
    const now = new Date();
    const notAfter = new Date(validity.notAfter);
    const notBefore = new Date(validity.notBefore);

    if (now < notBefore) {
      throw new InvalidCertificateError();
    }

    if (now > notAfter) {
      throw new ExpiredCertificateError();
    }

    // TODO: Make sure certificate authority is trusted
  }

  get issuer(): Issuer {
    const { issuer } = this.underlying;
    const result = {} as Issuer;
    for (const attribute of issuer.attributes) {
      if (attribute.name && attribute.value) {
        // TODO: Validate what attributes are available and avoid using the `as any` cast
        (result as any)[attribute.name] = attribute.value;
      }
    }

    return result;
  }

  get subject(): Subject {
    const { subject } = this.underlying;
    const result = {} as Subject;
    result.id = subject.getField({
      type: "2.5.4.45",
    })!.value as string;
    for (const attribute of subject.attributes) {
      if (attribute.name && attribute.value) {
        // TODO: Validate what attributes are available and avoid using the `as any` cast
        (result as any)[attribute.name] = attribute.value;
      }
    }

    return result;
  }

  get PEM() {
    return pki.certificateToPem(this.underlying);
  }
}

export { ExpiredCertificateError, InvalidCertificateError };
export default Certificate;
