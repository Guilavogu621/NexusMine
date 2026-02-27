import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/network/api_client.dart';

/// Message du chatbot
class ChatMessage {
  final String role; // 'user' ou 'assistant'
  final String content;
  final DateTime timestamp;

  ChatMessage({
    required this.role,
    required this.content,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toJson() => {
        'role': role,
        'content': content,
      };
}

/// État du chatbot
class ChatbotState {
  final List<ChatMessage> messages;
  final bool isLoading;
  final String? error;

  const ChatbotState({
    this.messages = const [],
    this.isLoading = false,
    this.error,
  });

  ChatbotState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    String? error,
  }) {
    return ChatbotState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Notifier pour le chatbot
class ChatbotNotifier extends StateNotifier<ChatbotState> {
  final ApiClient _apiClient;

  ChatbotNotifier(this._apiClient)
      : super(ChatbotState(messages: [
          ChatMessage(
            role: 'assistant',
            content:
                '👋 Bonjour ! Je suis NexusMine Copilot, votre assistant minier intelligent. Comment puis-je vous aider ?',
          ),
        ]));

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty || state.isLoading) return;

    final userMessage = ChatMessage(role: 'user', content: text.trim());

    state = state.copyWith(
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    );

    try {
      final history =
          state.messages.map((m) => m.toJson()).toList();

      final response = await _apiClient.dio.post(
        '/chatbot/',
        data: {
          'message': text.trim(),
          'history': history.sublist(0, history.length - 1),
          'context': 'OPERATOR', // Mobile = opérateur terrain uniquement
        },
      );

      final reply = response.data['reply'] as String? ?? 'Pas de réponse.';
      final assistantMessage =
          ChatMessage(role: 'assistant', content: reply);

      state = state.copyWith(
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      );
    } catch (e) {
      final errorMessage = ChatMessage(
        role: 'assistant',
        content: '⚠️ Erreur de connexion. Vérifiez votre réseau et réessayez.',
      );

      state = state.copyWith(
        messages: [...state.messages, errorMessage],
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  void clearChat() {
    state = ChatbotState(messages: [
      ChatMessage(
        role: 'assistant',
        content:
            '👋 Conversation réinitialisée. Comment puis-je vous aider ?',
      ),
    ]);
  }
}

/// Provider pour le chatbot
final chatbotProvider =
    StateNotifierProvider<ChatbotNotifier, ChatbotState>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ChatbotNotifier(apiClient);
});
