package com.shalik.feature.alerts.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.shalik.core.data.model.AlertSeverity
import com.shalik.core.data.model.AlertType
import com.shalik.core.data.model.ShalikAlert
import com.shalik.feature.alerts.template.ActionTemplate

private val FloodColor = Color(0xFF0277BD)
private val HeatColor = Color(0xFFD84315)
private val RainColor = Color(0xFF00695C)
private val WarningRed = Color(0xFFC62828)
private val AmberWatch = Color(0xFFEF6C00)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertsScreen(
    alerts: List<ShalikAlert>,
    uiState: AlertsUiState,
    onSelectAlert: (ShalikAlert) -> Unit,
    onDismissDetail: () -> Unit,
    onPlayAudio: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "দুর্যোগ ও কৃষি আবহাওয়া",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                        Text(
                            text = "বন্যা, খরা ও তাপদাহ পূর্বাভাস",
                            fontSize = 12.sp,
                            color = Color.DarkGray
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFFE8F5E9)
                )
            )
        }
    ) { padding ->
        Box(
            modifier = modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF9FBE7))
        ) {
            if (alerts.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF2E7D32),
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "কোনো সক্রিয় বিপদ সংকেত নেই",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2E7D32)
                        )
                        Text(
                            text = "আপনার এলাকার আবহাওয়া স্বাভাবিক আছে।",
                            fontSize = 13.sp,
                            color = Color.Gray
                        )
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(alerts, key = { it.id }) { alert ->
                        AlertCard(
                            alert = alert,
                            onClick = { onSelectAlert(alert) },
                            onPlayAudio = { onPlayAudio(alert.messageBn) }
                        )
                    }
                }
            }

            // Detail Modal / Sheet for Action Steps
            if (uiState.selectedAlert != null) {
                AlertDialog(
                    onDismissRequest = onDismissDetail,
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = WarningRed,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "জরুরি করণীয় নির্দেশনা",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                    },
                    text = {
                        Column {
                            Text(
                                text = uiState.selectedAlert.messageBn,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.Black
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            HorizontalDivider()
                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "কৃষি বিশেষজ্ঞের পদক্ষেপসমূহ:",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = Color(0xFF1B5E20)
                            )
                            Spacer(modifier = Modifier.height(6.dp))

                            uiState.selectedTemplates.forEach { template ->
                                Text(
                                    text = "📌 ${template.titleBn}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = Color(0xFF33691E)
                                )
                                template.actionStepsBn.forEachIndexed { i, step ->
                                    Text(
                                        text = "${i + 1}. $step",
                                        fontSize = 12.sp,
                                        modifier = Modifier.padding(start = 8.dp, top = 2.dp),
                                        lineHeight = 17.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                            }
                        }
                    },
                    confirmButton = {
                        Button(
                            onClick = onDismissDetail,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32))
                        ) {
                            Text("বুঝেছি")
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun AlertCard(
    alert: ShalikAlert,
    onClick: () -> Unit,
    onPlayAudio: () -> Unit
) {
    val containerColor = when (alert.severity) {
        AlertSeverity.EMERGENCY, AlertSeverity.WARNING -> Color(0xFFFFEBEE)
        AlertSeverity.WATCH -> Color(0xFFFFF3E0)
        AlertSeverity.ADVISORY -> Color(0xFFE8F5E9)
    }

    val badgeColor = when (alert.severity) {
        AlertSeverity.EMERGENCY, AlertSeverity.WARNING -> WarningRed
        AlertSeverity.WATCH -> AmberWatch
        AlertSeverity.ADVISORY -> Color(0xFF2E7D32)
    }

    val typeIcon = when (alert.type) {
        AlertType.FLOOD -> Icons.Default.WaterDrop
        AlertType.HEAT -> Icons.Default.WbSunny
        AlertType.CYCLONE -> Icons.Default.Air
        AlertType.HEAVY_RAIN -> Icons.Default.Thunderstorm
        AlertType.COLD -> Icons.Default.AcUnit
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = typeIcon,
                        contentDescription = null,
                        tint = badgeColor,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                        color = badgeColor,
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = alert.severity.labelBn,
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                IconButton(
                    onClick = onPlayAudio,
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.VolumeUp,
                        contentDescription = "বার্তা শুনুন",
                        tint = badgeColor,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = alert.messageBn,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF212121),
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "উৎস: ${alert.source}",
                    fontSize = 11.sp,
                    color = Color.Gray
                )
                Text(
                    text = "করণীয় দেখতে স্পর্শ করুন ➔",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = badgeColor
                )
            }
        }
    }
}
