"use client"

import { useEffect } from 'react'

interface ConfettiOptions {
    colors: string[]
    particleCount: number
    origin: { x: number; y: number }
    angle: number
    spread: number
    startVelocity: number
    gravity: number
    decay: number
    ticks: number
}

export function useConfetti(enabled: boolean, interval: number = 8000) {
    useEffect(() => {
        if (!enabled) return

        const createConfetti = (options: ConfettiOptions) => {
            const { colors, particleCount, origin, angle, spread, startVelocity, gravity, decay } = options

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div')
                particle.className = 'confetti-particle'

                // Random color from array
                const color = colors[Math.floor(Math.random() * colors.length)]

                // Calculate initial trajectory
                const angleInRadians = (angle + (Math.random() - 0.5) * spread) * (Math.PI / 180)
                const velocity = startVelocity * (0.5 + Math.random() * 0.5)
                const vx = Math.cos(angleInRadians) * velocity
                const vy = -Math.sin(angleInRadians) * velocity

                // Random size and shape
                const size = 5 + Math.random() * 5 // Reduced from 8 + random*8
                const shape = Math.random() > 0.5 ? 'square' : 'circle'

                // Position
                const startX = origin.x * window.innerWidth
                const startY = origin.y * window.innerHeight

                // Style
                particle.style.cssText = `
          position: fixed;
          left: ${startX}px;
          top: ${startY}px;
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border-radius: ${shape === 'circle' ? '50%' : '0'};
          pointer-events: none;
          z-index: 9999;
          transform-origin: center;
        `

                document.body.appendChild(particle)

                // Animate
                let posX = startX
                let posY = startY
                let velX = vx
                let velY = vy
                let rotation = Math.random() * 360
                let rotationSpeed = (Math.random() - 0.5) * 20
                let opacity = 1
                let frame = 0
                const maxFrames = 200

                const animate = () => {
                    frame++
                    if (frame > maxFrames) {
                        particle.remove()
                        return
                    }

                    // Update velocities
                    velY += gravity * 0.5
                    velX *= decay
                    velY *= decay

                    // Update position
                    posX += velX
                    posY += velY
                    rotation += rotationSpeed

                    // Fade out
                    opacity = 1 - (frame / maxFrames)

                    // Apply
                    particle.style.transform = `translate3d(${posX - startX}px, ${posY - startY}px, 0) rotate(${rotation}deg)`
                    particle.style.opacity = opacity.toString()

                    requestAnimationFrame(animate)
                }

                requestAnimationFrame(animate)
            }
        }

        const shootConfetti = () => {
            const colors = ['#00D9FF', '#9D00FF', '#FFD700'] // cyan, purple, yellow

            // Left side
            createConfetti({
                colors,
                particleCount: 80, // Increased from 50
                origin: { x: 0, y: 1 },
                angle: 60,
                spread: 55,
                startVelocity: 55, // Increased velocity
                gravity: 1.2,
                decay: 0.92,
                ticks: 200
            })

            // Right side
            createConfetti({
                colors,
                particleCount: 80, // Increased from 50
                origin: { x: 1, y: 1 },
                angle: 120,
                spread: 55,
                startVelocity: 55, // Increased velocity
                gravity: 1.2,
                decay: 0.92,
                ticks: 200
            })
        }

        // Initial confetti
        shootConfetti()

        // Repeat
        const timer = setInterval(shootConfetti, interval)

        return () => clearInterval(timer)
    }, [enabled, interval])
}
