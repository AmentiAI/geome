extends Node
## Global game state — autoloaded as `GameState`.

signal level_changed(level_data: Dictionary)
signal score_submitted(percent: float)
signal attempt_started()
signal attempt_failed(percent: float)
signal level_completed(percent: float)

var current_level: Dictionary = {}
var current_attempts: int = 1
var session_best_percent: float = 0.0
var practice_mode: bool = false
var coins_collected: int = 0
var web_origin: String = "http://localhost:3000"

func set_level(data: Dictionary) -> void:
    current_level = data
    current_attempts = 1
    session_best_percent = 0.0
    coins_collected = 0
    level_changed.emit(data)

func record_attempt_failed(percent: float) -> void:
    current_attempts += 1
    if percent > session_best_percent:
        session_best_percent = percent
    attempt_failed.emit(percent)

func record_completion() -> void:
    session_best_percent = 100.0
    level_completed.emit(100.0)
