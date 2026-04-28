extends Node
## Audio + beat-sync helper. Autoloaded as `AudioSync`.
##
## Geometry-Dash-style games scroll the camera at a constant horizontal speed
## that's locked to the song. We expose:
##
##   bpm, offset_ms, song_position_ms — to drive beat indicators
##   x_at(time_ms)   — world-x for a given song time (camera scroll formula)
##   time_at(x)      — song time for a given world-x (used by the editor)
##
## Standard GD-style speed multipliers (1×=1, 2×=1.4, etc.) are applied below.

signal beat(beat_index: int)

const SPEED_MULTIPLIERS := {1: 1.0, 2: 1.4, 3: 1.7, 4: 2.0}
const PIXELS_PER_SECOND_BASE := 311.58 # GD 1× — kept for parity feel

var stream_player: AudioStreamPlayer
var bpm: float = 120.0
var offset_ms: float = 0.0
var speed_tier: int = 1
var _last_beat_index: int = -1

func _ready() -> void:
    stream_player = AudioStreamPlayer.new()
    stream_player.bus = "Master"
    add_child(stream_player)

func play_song(stream: AudioStream, song_bpm: float, song_offset_ms: float, song_speed: int = 1) -> void:
    bpm = song_bpm
    offset_ms = song_offset_ms
    speed_tier = song_speed
    stream_player.stream = stream
    stream_player.play()
    _last_beat_index = -1

func stop() -> void:
    stream_player.stop()

func _process(_delta: float) -> void:
    if not stream_player.playing:
        return
    var ms := song_position_ms()
    var beat_ms := 60000.0 / bpm
    var idx := int(floor((ms - offset_ms) / beat_ms))
    if idx != _last_beat_index and idx >= 0:
        _last_beat_index = idx
        beat.emit(idx)

func song_position_ms() -> float:
    return stream_player.get_playback_position() * 1000.0

func pixels_per_second() -> float:
    return PIXELS_PER_SECOND_BASE * SPEED_MULTIPLIERS.get(speed_tier, 1.0)

func x_at(time_ms: float) -> float:
    return (time_ms / 1000.0) * pixels_per_second()

func time_at(x: float) -> float:
    return (x / pixels_per_second()) * 1000.0
