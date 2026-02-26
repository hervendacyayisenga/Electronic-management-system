package com.example.a24768_midterm_bank;

import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class FixedActivityFindViewBeforeSetContent extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.practice_findview);

        Button practiceButton = findViewById(R.id.btnPractice);
        practiceButton.setOnClickListener(v -> {
            // No-op; this activity is for practice only.
        });
    }
}
