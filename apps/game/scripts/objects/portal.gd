extends Area2D

@export var kind: String = "gravity" # gravity | speed | mode
@export var payload: Variant = null # speed tier (int) or mode name (String)

func _ready() -> void:
    collision_layer = 1 << 3
    collision_mask = 1 << 1
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
    if not body.is_in_group(&"player"):
        return
    match kind:
        "gravity":
            if body.has_method("flip_gravity"):
                body.flip_gravity()
        "speed":
            if body.has_method("set_speed_tier"):
                body.set_speed_tier(int(payload))
        "mode":
            if body.has_method("set_mode"):
                body.set_mode(StringName(String(payload)))
