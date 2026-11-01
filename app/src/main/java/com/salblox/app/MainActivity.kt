package com.salblox.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.salblox.app.ui.Root
import com.salblox.app.ui.SalBloxTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SalBloxTheme {
                Root()
            }
        }
    }
}
