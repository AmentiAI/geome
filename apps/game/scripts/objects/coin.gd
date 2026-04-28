extends Area2D

var collected: bool = false

func _ready() -> void:
    collision_layer = 1 << 3
    collision_mask = 1 << 1
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
    if collected or not body.is_in_group(&"player"):
        return
    collected = true
    GameState.coins_collected += 1
    queue_free()
