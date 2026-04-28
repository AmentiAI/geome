extends Area2D

func _ready() -> void:
    collision_layer = 1 << 2
    collision_mask = 1 << 1
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
    if body.is_in_group(&"player") and body.has_method("die"):
        body.die()
