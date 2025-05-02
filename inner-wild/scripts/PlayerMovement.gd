# PlayerMovement.gd
extends CharacterBody2D

@export var speed: float = 200.0  # pixels per second
@onready var anim: AnimatedSprite2D = $AnimatedSprite2D
var last_direction: Vector2

func _physics_process(delta: float) -> void:
	var direction: Vector2 = Input.get_vector(
		"ui_left", "ui_right",
		"ui_up",   "ui_down"
	) 
	if direction != Vector2.ZERO:
		if direction.y < 0:
			anim.play("walk_up")
			last_direction = Vector2.UP			
		elif direction.y > 0:
			anim.play("walk_down")
			last_direction = Vector2.DOWN					
		elif direction.x > 0:
			anim.play("walk_right")
			last_direction = Vector2.RIGHT								
		else:
			anim.play("walk_left")
			last_direction = Vector2.LEFT											
	else:
		anim.play("idle")
		#match last_direction:
			#Vector2.RIGHT: anim.frame = 1
			#Vector2.LEFT: anim.frame = 2
			#Vector2.UP: anim.frame = 3			
			#_: anim.frame = 0
			
	velocity = direction * speed
	move_and_slide()
