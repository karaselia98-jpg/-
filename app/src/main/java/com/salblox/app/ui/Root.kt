package com.salblox.app.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

// The four tabs of the app, in the same order as Swift's RootView
enum class Tab(val label: String) { Home("Home"), Moments("Moments"), Chat("Chat"), Me("Me") }

@Composable
fun Root() {
    var tab by remember { mutableStateOf(Tab.Home) }
    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = SbBg) {
                Tab.values().forEach { t ->
                    NavigationBarItem(
                        selected = tab == t,
                        onClick = { tab = t },
                        icon = { Text(t.label.take(1)) },
                        label = { Text(t.label) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = SbInk,
                            selectedTextColor = SbInk,
                            indicatorColor = SbTile,
                            unselectedIconColor = SbFaint,
                            unselectedTextColor = SbFaint,
                        ),
                    )
                }
            }
        },
        containerColor = SbBg,
    ) { inner ->
        Box(Modifier.fillMaxSize().padding(inner), contentAlignment = Alignment.Center) {
            // Screens are added one by one; each tab is a placeholder until it is ported
            Text(tab.label, color = SbInk)
        }
    }
}
