package com.example.a24768_midterm_bank;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class DashboardActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        TextView welcomeText = findViewById(R.id.tvWelcome);
        String username = getIntent().getStringExtra("username");
        if (username == null || username.trim().isEmpty()) {
            welcomeText.setText("Welcome to the bank app");
        } else {
            welcomeText.setText("Welcome, " + username);
        }

        Button signUpButton = findViewById(R.id.btnSignUp);
        signUpButton.setOnClickListener(v -> {
            Intent intent = new Intent(DashboardActivity.this, SignUpActivity.class);
            startActivity(intent);
        });
    }
}
