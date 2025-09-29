
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:my_data_gpt_app/models/chat_message.dart';
import 'package:my_data_gpt_app/services/secure_storage_service.dart';

class OpenAIService {
  static const String _apiUrl = 'https://api.openai.com/v1/chat/completions';
  final SecureStorageService _secureStorageService = SecureStorageService();

  Future<String> getResponse(List<ChatMessage> messages) async {
    final apiKey = await _secureStorageService.getApiKey();
    if (apiKey == null) {
      return 'Error: API key not found.';
    }

    try {
      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $apiKey',
        },
        body: jsonEncode({
          'model': 'gpt-3.5-turbo',
          'messages': messages
              .map((m) => {'role': m.role.toString().split('.').last, 'content': m.content})
              .toList(),
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'];
      } else {
        return 'Error: ${response.statusCode} - ${response.body}';
      }
    } catch (e) {
      return 'Error: $e';
    }
  }
}
