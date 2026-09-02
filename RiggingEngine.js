class RiggingEngine {
    constructor() {
        this.canvas = document.getElementById('videoCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.bones = [];        
        this.bgImage = null;    
        this.initUploadEvent(); 
        this.initCanvasEvents(); 
        this.drawAll();         
    }

    initUploadEvent() {
        const btnUpload = document.getElementById('btn-upload');
        const fileInput = document.getElementById('image-upload');

        btnUpload?.addEventListener('click', () => fileInput.click());

        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    this.bgImage = img; 
                    this.drawAll();     
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    initCanvasEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

            let clickedBone = this.checkClickBone(mousePos);

            if (clickedBone) {
                if (window.appEngine && window.appEngine.gizmo) {
                    window.appEngine.gizmo.handleMouseDown(mousePos, clickedBone);
                }
            } else {
                const newBone = {
                    id: Date.now(), 
                    name: `Xương_${this.bones.length + 1}`,
                    position: { x: mousePos.x, y: mousePos.y },
                    rotation: 0, 
                    scale: { x: 1, y: 1 } 
                };
                this.bones.push(newBone);
                if (window.appEngine && window.appEngine.gizmo) {
                    window.appEngine.gizmo.selectedBone = newBone;
                }
            }
            this.drawAll();
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

            if (window.appEngine && window.appEngine.gizmo && window.appEngine.gizmo.isDragging) {
                window.appEngine.gizmo.handleMouseMove(mousePos);
                this.drawAll(); 
            }
        });

        window.addEventListener('mouseup', () => {
            if (window.appEngine && window.appEngine.gizmo) {
                window.appEngine.gizmo.handleMouseUp();
            }
        });
    }

    checkClickBone(mousePos) {
        for (let bone of this.bones) {
            const distance = Math.hypot(mousePos.x - bone.position.x, mousePos.y - bone.position.y);
            if (distance < 15) return bone; 
        }
        return null;
    }

    drawAll() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.bgImage) {
            this.ctx.drawImage(this.bgImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = '#18181b';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Vẽ lưới ô vuông đồ họa nền
        this.ctx.strokeStyle = '#27272a';
        this.ctx.lineWidth = 0.5;
        for(let x=0; x<this.canvas.width; x+=30) {
            this.ctx.beginPath(); this.ctx.moveTo(x,0); this.ctx.lineTo(x,this.canvas.height); this.ctx.stroke();
        }
        for(let y=0; y<this.canvas.height; y+=30) {
            this.ctx.beginPath(); this.ctx.moveTo(0,y); this.ctx.lineTo(this.canvas.width,y); this.ctx.stroke();
        }

        this.bones.forEach(bone => {
            this.ctx.save(); 
            this.ctx.translate(bone.position.x, bone.position.y);
            this.ctx.rotate(bone.rotation);
            this.ctx.scale(bone.scale.x, bone.scale.y);

            const isSelected = (window.appEngine && window.appEngine.gizmo.selectedBone?.id === bone.id);

            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(12, -5);
            this.ctx.lineTo(45, 0);
            this.ctx.lineTo(12, 5);
            this.ctx.closePath();
            this.ctx.fillStyle = isSelected ? 'rgba(0, 122, 204, 0.4)' : 'rgba(239, 68, 68, 0.3)';
            this.ctx.fill();
            this.ctx.strokeStyle = isSelected ? '#007acc' : '#ef4444';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(0, 0, 7, 0, Math.PI * 2);
            this.ctx.fillStyle = isSelected ? '#00ebff' : '#fbbf24';
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '11px sans-serif';
            this.ctx.fillText(bone.name, 12, -8);

            this.ctx.restore(); 
        });
    }
}
