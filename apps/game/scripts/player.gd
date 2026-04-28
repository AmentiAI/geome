extends CharacterBody2D
## Cube-mode rhythm platformer player.
##
## Behavior summary (matches GD-feel):
##   * X velocity is locked to the audio scroll speed.
##   * Pressing/holding "jump" while grounded launches an arc that lands roughly
##     1 beat later — gravity is tuned so you can clear a 1-tile spike with one tap.
##   * Mid-air rotation is purely cosmetic (snap to 90° on land).
##   * Death restarts the attempt at start (or last checkpoint in practice).
##
## Other modes (ship, ball, ufo, wave) extend this script via the `mode` field.

class_name Player

signal died(percent: float)
signal completed()
signal coin_picked(idx: int)

const JUMP_VELOCITY := -780.0
const GRAVITY_NORMAL := 2400.0
const GRAVITY_FLIPPED := -2400.0
const ROTATE_SPEED := TAU * 1.6 # rad/sec while airborne

@export var mode: StringName = &"cube"
@export var level_length_px: float = 0.0
@export var spawn_x: float = 80.0
@export var ground_y: float = 540.0

var gravity: float = GRAVITY_NORMAL
var dead: bool = false
var finished: bool = false
var start_time_ms: int = 0
var visual: Node2D

func _ready() -> void:
    add_to_group(&"player")
    collision_layer = 1 << 1
    collision_mask = (1 << 0) | (1 << 2) | (1 << 3)
    visual = $Visual if has_node("Visual") else null
    _reset()

func _physics_process(delta: float) -> void:
    if dead or finished:
        return

    velocity.x = AudioSync.pixels_per_second()
    velocity.y += gravity * delta

    var grounded := is_on_floor() or position.y >= ground_y - 1.0

    if grounded:
        if Input.is_action_pressed(&"jump"):
            velocity.y = JUMP_VELOCITY * sign(GRAVITY_NORMAL / gravity)
        if visual:
            visual.rotation = snappedf(visual.rotation, PI / 2)
    else:
        if visual:
            visual.rotation += ROTATE_SPEED * delta * sign(gravity)

    move_and_slide()

    if position.y > ground_y:
        position.y = ground_y
        velocity.y = 0

    if level_length_px > 0 and position.x >= level_length_px:
        _complete()

func current_percent() -> float:
    if level_length_px <= 0:
        return 0.0
    return clampf(position.x / level_length_px * 100.0, 0.0, 100.0)

func die() -> void:
    if dead:
        return
    dead = true
    died.emit(current_percent())

func flip_gravity() -> void:
    gravity = -gravity

func set_speed_tier(tier: int) -> void:
    AudioSync.speed_tier = tier

func set_mode(new_mode: StringName) -> void:
    mode = new_mode

func _reset() -> void:
    dead = false
    finished = false
    position = Vector2(spawn_x, ground_y)
    velocity = Vector2.ZERO
    gravity = GRAVITY_NORMAL
    start_time_ms = Time.get_ticks_msec()
    if visual:
        visual.rotation = 0.0

func _complete() -> void:
    finished = true
    completed.emit()
