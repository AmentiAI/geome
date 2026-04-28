extends Node
## Builds level scenes from the shared JSON schema (packages/shared/level-schema.ts).
##
## The shared schema's coordinate system uses the editor's own pixel grid
## (typically 30 px). We treat (x, y) in JSON as world coordinates with y growing
## downward — the same as Godot's 2D space. The "ground" is at y = 540 by
## convention; objects with negative y go above the ground.

class_name LevelLoader

const GRID := 30.0
const GROUND_Y := 540.0

const SCENE_BLOCK := preload("res://scenes/objects/Block.tscn")
const SCENE_SPIKE := preload("res://scenes/objects/Spike.tscn")
const SCENE_PORTAL := preload("res://scenes/objects/Portal.tscn")
const SCENE_JUMP_PAD := preload("res://scenes/objects/JumpPad.tscn")
const SCENE_COIN := preload("res://scenes/objects/Coin.tscn")
const SCENE_CHECKPOINT := preload("res://scenes/objects/Checkpoint.tscn")

static func build(level_root: Node2D, level_data: Dictionary) -> float:
    """Spawns all objects under level_root. Returns the rightmost X (level length)."""
    var max_x := 0.0
    var objects: Array = level_data.get("objects", [])
    for obj in objects:
        var node := _spawn(obj)
        if node == null:
            continue
        node.position = Vector2(float(obj.get("x", 0)), float(obj.get("y", GROUND_Y)))
        if obj.has("rotation"):
            node.rotation = deg_to_rad(float(obj["rotation"]))
        if obj.has("scale"):
            var s := float(obj["scale"])
            node.scale = Vector2(s, s)
        level_root.add_child(node)
        max_x = max(max_x, node.position.x + GRID)
    # Add at least one screen of run-out before the finish trigger:
    return max_x + 480.0

static func _spawn(obj: Dictionary) -> Node2D:
    match obj.get("type", ""):
        "block": return SCENE_BLOCK.instantiate()
        "spike": return SCENE_SPIKE.instantiate()
        "jump_pad", "jump_orb": return SCENE_JUMP_PAD.instantiate()
        "portal_gravity":
            var p := SCENE_PORTAL.instantiate()
            p.kind = "gravity"
            return p
        "portal_speed":
            var p := SCENE_PORTAL.instantiate()
            p.kind = "speed"
            p.payload = int(obj.get("props", {}).get("tier", 2))
            return p
        "portal_mode":
            var p := SCENE_PORTAL.instantiate()
            p.kind = "mode"
            p.payload = String(obj.get("props", {}).get("mode", "ship"))
            return p
        "coin": return SCENE_COIN.instantiate()
        "checkpoint": return SCENE_CHECKPOINT.instantiate()
    push_warning("Unknown object type: %s" % obj.get("type", ""))
    return null
