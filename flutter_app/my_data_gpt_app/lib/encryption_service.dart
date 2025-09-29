import 'dart:convert';
import 'dart:typed_data';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pointycastle/digests/sha256.dart';
import 'package:pointycastle/key_derivators/api.dart' show Pbkdf2Parameters;
import 'package:pointycastle/key_derivators/pbkdf2.dart';
import 'package:pointycastle/macs/hmac.dart';

class EncryptionService {
  final _storage = const FlutterSecureStorage();

  encrypt.Key _deriveKey(String password, Uint8List salt) {
    final derivator = PBKDF2KeyDerivator(HMac(SHA256Digest(), 64))
      ..init(Pbkdf2Parameters(salt, 100000, 32));

    return encrypt.Key(derivator.process(Uint8List.fromList(utf8.encode(password))));
  }

  Future<Map<String, dynamic>> encryptData(String password, String data) async {
    final salt = encrypt.IV.fromSecureRandom(16).bytes; // Generate a random 16-byte salt
    final key = _deriveKey(password, salt);
    final iv = encrypt.IV.fromSecureRandom(12);
    final encrypter = encrypt.Encrypter(encrypt.AES(key, mode: encrypt.AESMode.gcm));

    final encrypted = encrypter.encrypt(data, iv: iv);

    await _storage.write(key: 'salt', value: base64.encode(salt));
    await _storage.write(key: 'iv', value: iv.base64);

    return {
      'encryptedData': encrypted.base64,
      'salt': base64.encode(salt),
      'iv': iv.base64,
    };
  }

  Future<String> decryptData(String password, String encryptedData) async {
    final saltString = await _storage.read(key: 'salt');
    final ivString = await _storage.read(key: 'iv');

    if (saltString == null || ivString == null) {
      throw Exception('Salt or IV not found in secure storage');
    }

    final salt = base64.decode(saltString);
    final iv = encrypt.IV.fromBase64(ivString);
    final key = _deriveKey(password, salt);
    final encrypter = encrypt.Encrypter(encrypt.AES(key, mode: encrypt.AESMode.gcm));

    final decrypted = encrypter.decrypt64(encryptedData, iv: iv);

    return decrypted;
  }
}
