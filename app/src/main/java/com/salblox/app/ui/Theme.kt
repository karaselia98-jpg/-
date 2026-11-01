package com.salblox.app.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Colours from Swift's App/Shared/Theme.swift (bg, tile, ink, faint, bloxBlue)
val SbBg = Color(0xFF121215)
val SbTile = Color(0xFF282930)
val SbInk = Color(0xFFF7F7F8)
val SbFaint = Color(0xFFD5D7DD)
val SbBlue = Color(0xFF335FFF)

private val scheme = darkColorScheme(
    background = SbBg,
    surface = SbBg,
    surfaceVariant = SbTile,
    onBackground = SbInk,
    onSurface = SbInk,
    onSurfaceVariant = SbFaint,
    primary = SbBlue,
    onPrimary = SbInk,
)

@Composable
fun SalBloxTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = scheme, content = content)
}
