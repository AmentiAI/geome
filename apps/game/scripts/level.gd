extends Node2D
## A loaded, playable level. Owns the player, camera, objects, and HUD wiring.

class_name Level

signal restart_requested

@export var level_data: Dictionary = {}

@onready var player: CharacterBody2D = $Player
@onready var camera: Camera2D = $Camera2D
@onready var objects_root: Node2D = $Objects
@onready var hud: CanvasLayer = $HUD

var checkpoint_pos: Vector2 = Vector2.ZERO
var has_checkpoint: bool = false
var attempt_start_ms: int = 0

func _ready() -> void:
    add_to_group(&"level")
    var length := LevelLoader.build(objects_root, level_data)
    player.level_length_px = length
    player.died.connect(_on_player_died)
    player.completed.connect(_on_player_completed)
    GameState.set_level(level_data)
    _start_attempt()

func _start_attempt() -> void:
    attempt_start_ms = Time.get_ticks_msec()
    GameState.attempt_started.emit()
    if has_checkpoint:
        player.position = checkpoint_pos
    player._reset()

func _process(_delta: float) -> void:
    if camera and player:
        camera.position.x = player.position.x + 200.0

    if Input.is_action_just_pressed(&"restart"):
        restart_requested.emit()
        _start_attempt()

func record_checkpoint(pos: Vector2) -> void:
    if GameState.practice_mode:
        checkpoint_pos = pos
        has_checkpoint = true

func _on_player_died(percent: float) -> void:
    GameState.record_attempt_failed(percent)
    var duration_ms := Time.get_ticks_msec() - attempt_start_ms
    if not GameState.practice_mode and level_data.has("id"):
        ApiClient.submit_score(
            String(level_data["id"]),
            percent,
            1,
            duration_ms,
            GameState.coins_collected,
            false,
        )
    await get_tree().create_timer(0.4).timeout
    _start_attempt()

func _on_player_completed() -> void:
    GameState.record_completion()
    var duration_ms := Time.get_ticks_msec() - attempt_start_ms
    if level_data.has("id"):
        ApiClient.submit_score(
            String(level_data["id"]),
            100.0,
            1,
            duration_ms,
            GameState.coins_collected,
            GameState.practice_mode,
        )
