extends Area2D

func _ready() -> void:
    collision_layer = 1 << 3
    collision_mask = 1 << 1
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
    # Practice-mode checkpoints are stored on the level scene; the player just
    # exposes its current percent and position via a setter on the level.
    if not body.is_in_group(&"player"):
        return
    var level := get_tree().get_first_node_in_group(&"level")
    if level and level.has_method("record_checkpoint"):
        level.record_checkpoint(body.position)
