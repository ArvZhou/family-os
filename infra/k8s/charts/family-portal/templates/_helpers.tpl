{{- define "chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "chart.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "chart.name" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "chart.labels" -}}
app: {{ include "chart.name" . }}
release: {{ .Release.Name }}
{{- end }}

{{- define "chart.selectorLabels" -}}
app: {{ include "chart.name" . }}
release: {{ .Release.Name }}
{{- end }}
