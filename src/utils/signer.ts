import { Buffer } from "buffer";
import { asn1, md, pki, util } from "node-forge";

import Certificate from "./certificate";
class MismatchedPublicKeyError extends Error {}
class UnsupportedEd25519KeyError extends Error {}
class SignatureVerificationError extends Error {}

interface Options {
  newPassphrase?: string;
}

class Signer {
  constructor(
    public readonly certificate: Certificate,
    private readonly encryptedPrivateKey: asn1.Asn1,
    passphrase?: string,
    options: Options = {}
  ) {
    if (passphrase) {
      this._validate(passphrase);
      if (options.newPassphrase) {
        const encryptedPrivateKey = pki.encryptPrivateKeyInfo(
          this._decryptedPrivateKey(passphrase),
          options.newPassphrase
        );
        this.encryptedPrivateKey = encryptedPrivateKey;
      }
    }
  }

  private _validate(passhprase: string) {
    const privateKey = this.privateKey(passhprase);
    const publicKeyFingerPrint = pki
      .getPublicKeyFingerprint(pki.setRsaPublicKey(privateKey.n, privateKey.e))
      .toHex();

    if (this.publicKeyFingerPrint.toHex() !== publicKeyFingerPrint) {
      throw new MismatchedPublicKeyError();
    }

    // TODO: Make sure certificate authority is trusted
  }

  get publicKey() {
    const publicKey = this.certificate.underlying.publicKey;
    if (Buffer.isBuffer(publicKey) || ArrayBuffer.isView(publicKey)) {
      throw new UnsupportedEd25519KeyError();
    }
    return publicKey;
  }

  get publicKeyFingerPrint() {
    return pki.getPublicKeyFingerprint(this.publicKey);
  }

  public privateKey(passphrase: string) {
    return pki.privateKeyFromAsn1(this._decryptedPrivateKey(passphrase));
  }

  get encryptedPrivateKeyPEM() {
    return pki.encryptedPrivateKeyToPem(this.encryptedPrivateKey);
  }

  public sign(data: string, passphrase: string) {
    const privateKey = this.privateKey(passphrase);
    const messageDigest = md.sha256.create();
    messageDigest.update(data, "raw");
    const signature = privateKey.sign(messageDigest);

    if (!this.publicKey.verify(messageDigest.digest().bytes(), signature)) {
      throw new SignatureVerificationError();
    }

    return signature;
  }

  private _decryptedPrivateKey(passphrase: string) {
    return pki.decryptPrivateKeyInfo(this.encryptedPrivateKey, passphrase);
  }
}

export { MismatchedPublicKeyError };
export default Signer;
