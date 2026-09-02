class TransformGizmo {
    constructor() {
        this.currentMode = 'translate'; 
        this.selectedBone = null;       
        this.isDragging = false;         
        this.startMousePos = { x: 0, y: 0 }; 
        this.initButtonEvents();        
    }

    initButtonEvents() {
        const modes = ['translate', 'rotate', 'scale'];
        modes.forEach(mode => {
            const btn = document.getElementById(`btn-${mode}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    modes.forEach(m => document.getElementById(`btn-${m}`)?.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentMode = mode;
                    console.log(`[Gizmo] Chuyển sang chế độ: ${mode.toUpperCase()}`);
                });
            }
        });
    }

    handleMouseDown(mousePos, bone) {
        if (!bone) return;
        this.selectedBone = bone;
        this.isDragging = true;
        this.startMousePos = { ...mousePos }; 
    }

    handleMouseMove(currentMousePos) {
        if (!this.isDragging || !this.selectedBone) return;

        const deltaX = currentMousePos.x - this.startMousePos.x;
        const deltaY = currentMousePos.y - this.startMousePos.y;

        if (this.currentMode === 'translate') {
            this.selectedBone.position.x += deltaX;
            this.selectedBone.position.y += deltaY;
        } 
        else if (this.currentMode === 'rotate') {
            const angle = Math.atan2(
                currentMousePos.y - this.selectedBone.position.y, 
                currentMousePos.x - this.selectedBone.position.x
            );
            this.selectedBone.rotation = angle;
        } 
        else if (this.currentMode === 'scale') {
            const scaleFactor = 1 + (deltaX * 0.005);
            this.selectedBone.scale.x = Math.max(0.1, this.selectedBone.scale.x * scaleFactor);
            this.selectedBone.scale.y = Math.max(0.1, this.selectedBone.scale.y * scaleFactor);
        }

        this.startMousePos = { ...currentMousePos };
    }

    handleMouseUp() {
        this.isDragging = false;
    }
}
