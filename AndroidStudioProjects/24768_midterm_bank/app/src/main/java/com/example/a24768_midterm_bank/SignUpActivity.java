package com.example.a24768_midterm_bank;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class SignUpActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sign_up);

        EditText fullNameInput = findViewById(R.id.etFullName);
        EditText emailInput = findViewById(R.id.etEmail);
        EditText passwordInput = findViewById(R.id.etSignUpPassword);
        Button createAccountButton = findViewById(R.id.btnCreateAccount);

        createAccountButton.setOnClickListener(v -> {
            String name = fullNameInput.getText().toString().trim();
            String email = emailInput.getText().toString().trim();

            if (name.isEmpty() || email.isEmpty()) {
                Toast.makeText(this, "Please fill all required fields", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "Account created for " + name, Toast.LENGTH_SHORT).show();
                finish();
            }
        });
    }
}
