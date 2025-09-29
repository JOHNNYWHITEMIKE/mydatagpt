import 'package:flutter/material.dart';
import 'package:my_data_gpt_app/screens/chat/chat_screen.dart';
import 'package:my_data_gpt_app/screens/vault/vault_screen.dart';
import 'package:my_data_gpt_app/widgets/custom_button.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("MyDataGPT")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            CustomButton(
              text: "Go to Chat",
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ChatScreen()),
                );
              },
            ),
            CustomButton(
              text: "Go to Vault",
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const VaultScreen()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
