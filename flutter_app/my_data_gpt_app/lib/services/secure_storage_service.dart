
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:encrypt/encrypt.dart';

class SecureStorageService {
  final _storage = const FlutterSecureStorage();

  // IMPORTANT: In a real-world application, this key should be derived from 
  // a user-specific value, such as their password, and not hardcoded.
  final _encryptionKey = 'my-super-secret-encryption-key-32';

  Future<void> saveApiKey(String apiKey) async {
    final key = Key.fromUtf8(_encryptionKey);
    final encrypter = Encrypter(AES(key));
    final iv = IV.fromLength(16);

    final encrypted = encrypter.encrypt(apiKey, iv: iv);
    await _storage.write(key: 'openai_api_key', value: encrypted.base64);
    await _storage.write(key: 'openai_api_key_iv', value: iv.base64);
  }

  Future<String?> getApiKey() async {
    final encryptedKey = await _storage.read(key: 'openai_api_key');
    final ivBase64 = await _storage.read(key: 'openai_api_key_iv');

    if (encryptedKey == null || ivBase64 == null) {
      return null;
    }

    final key = Key.fromUtf8(_encryptionKey);
    final encrypter = Encrypter(AES(key));
    final iv = IV.fromBase64(ivBase64);

    try {
      final decrypted = encrypter.decrypt(Encrypted.fromBase64(encryptedKey), iv: iv);
      return decrypted;
    } catch (e) {
      // Handle decryption errors, e.g., if the key is incorrect
      return null;
    }
  }

  Future<void> deleteApiKey() async {
    await _storage.delete(key: 'openai_api_key');
    await _storage.delete(key: 'openai_api_key_iv');
  }
}
