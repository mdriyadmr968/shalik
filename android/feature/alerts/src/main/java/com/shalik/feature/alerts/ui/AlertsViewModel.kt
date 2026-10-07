package com.shalik.feature.alerts.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shalik.core.data.model.ShalikAlert
import com.shalik.core.data.repository.AlertRepository
import com.shalik.core.data.repository.FarmerProfileRepository
import com.shalik.feature.alerts.template.ActionTemplate
import com.shalik.feature.alerts.template.AlertActionTemplates
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AlertsUiState(
    val selectedAlert: ShalikAlert? = null,
    val selectedTemplates: List<ActionTemplate> = emptyList(),
    val isSpeaking: Boolean = false
)

@HiltViewModel
class AlertsViewModel @Inject constructor(
    private val alertRepository: AlertRepository,
    private val farmerProfileRepository: FarmerProfileRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AlertsUiState())
    val uiState: StateFlow<AlertsUiState> = _uiState.asStateFlow()

    val farmerProfile = farmerProfileRepository.farmerProfile
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    val alerts: StateFlow<List<ShalikAlert>> = alertRepository.getAllAlerts()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun selectAlert(alert: ShalikAlert) {
        val crop = farmerProfile.value?.primaryCrops?.firstOrNull() ?: "ধান"
        val templates = AlertActionTemplates.getTemplatesForAlert(alert.type, crop)
        _uiState.value = _uiState.value.copy(
            selectedAlert = alert,
            selectedTemplates = templates
        )
        viewModelScope.launch {
            alertRepository.markAsRead(alert.id)
        }
    }

    fun dismissDetail() {
        _uiState.value = _uiState.value.copy(
            selectedAlert = null,
            selectedTemplates = emptyList()
        )
    }
}
