import 'package:flutter/material.dart';
import '../../widgets/custom_button.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("Login to MyDataGPT"),
            const SizedBox(height: 20),
            CustomButton(
              text: "Login (Stub)",
              onPressed: () {
                Navigator.pushReplacementNamed(context, '/chat');
              },
            ),
          ],
        ),
      ),
    );
  }
}