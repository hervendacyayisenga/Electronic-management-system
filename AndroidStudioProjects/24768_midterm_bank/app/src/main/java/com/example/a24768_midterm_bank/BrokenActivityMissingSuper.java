package com.example.a24768_midterm_bank;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

public class BrokenActivityMissingSuper extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // TODO: Fix this by calling super.onCreate(savedInstanceState) before setContentView.
        setContentView(R.layout.practice_missing_super);
    }
}
