
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:my_data_gpt_app/screens/splash_screen.dart';
import 'package:my_data_gpt_app/screens/auth/auth_screen.dart';
import 'package:my_data_gpt_app/screens/chat/chat_screen.dart';
import 'package:my_data_gpt_app/screens/vault/vault_screen.dart';

final router = GoRouter(
  redirect: (BuildContext context, GoRouterState state) {
    final bool loggedIn = FirebaseAuth.instance.currentUser != null;
    final bool loggingIn = state.matchedLocation == '/auth';

    // If the user is not logged in and not on the auth screen, redirect to the auth screen.
    if (!loggedIn && !loggingIn) {
      return '/auth';
    }

    // If the user is logged in and on the auth screen, redirect to the chat screen.
    if (loggedIn && loggingIn) {
      return '/chat';
    }

    return null;
  },
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/auth',
      builder: (context, state) => const AuthScreen(),
    ),
    GoRoute(
      path: '/chat',
      builder: (context, state) => const ChatScreen(),
    ),
    GoRoute(
      path: '/vault',
      builder: (context, state) => const VaultScreen(),
    ),
  ],
);
