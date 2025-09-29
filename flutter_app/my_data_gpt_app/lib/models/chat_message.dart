
enum ChatMessageRole { user, assistant }

class ChatMessage {
  final ChatMessageRole role;
  final String content;

  ChatMessage({required this.role, required this.content});
}
