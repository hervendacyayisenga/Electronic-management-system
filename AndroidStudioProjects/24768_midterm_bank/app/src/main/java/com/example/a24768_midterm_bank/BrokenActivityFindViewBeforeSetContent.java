package com.example.a24768_midterm_bank;

import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class BrokenActivityFindViewBeforeSetContent extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // TODO: Fix this by calling setContentView before findViewById.
        Button practiceButton = findViewById(R.id.btnPractice);

        setContentView(R.layout.practice_findview);

        practiceButton.setOnClickListener(v -> {
            // No-op; this activity is for practice only.
        });
    }
}
