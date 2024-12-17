'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

interface VideoComponentProps {
    onVideoReady: (videoElement: HTMLVideoElement) => void;
    onCanvasReady: (canvasElement: HTMLCanvasElement) => void;
    isCameraReady: boolean;
    hasFaceDetected: boolean;
    onFaceDetected: (detected: boolean) => void;
}

const VideoComponent = ({
                            onVideoReady,
                            onCanvasReady,
                            isCameraReady,
                            hasFaceDetected,
                            onFaceDetected
                        }: VideoComponentProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectionIntervalRef = useRef<NodeJS.Timeout>();
    const [isVideoLoading, setIsVideoLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const startVideo = async () => {
            try {
                if (!videoRef.current) return;

                // Tambahkan event listeners sebelum memulai stream
                videoRef.current.addEventListener('loadeddata', () => {
                    if (mounted) setIsVideoLoading(false);
                });

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user',
                        frameRate: { ideal: 30 }
                    },
                    audio: false
                });

                if (videoRef.current && mounted) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();

                    // Set canvas dimensions setelah video siap
                    if (canvasRef.current) {
                        const videoWidth = videoRef.current.videoWidth;
                        const videoHeight = videoRef.current.videoHeight;

                        canvasRef.current.width = videoWidth;
                        canvasRef.current.height = videoHeight;

                        onVideoReady(videoRef.current);
                        onCanvasReady(canvasRef.current);

                        // Mulai deteksi wajah setelah video dan canvas siap
                        await startFaceDetection();
                    }
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
                setIsVideoLoading(false);
            }
        };

        const startFaceDetection = async () => {
            if (!videoRef.current || !canvasRef.current) return;

            try {
                // Load models jika belum dimuat
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                ]);

                // Gunakan requestAnimationFrame alih-alih setInterval
                const detectFaces = async () => {
                    if (!mounted || !videoRef.current || !canvasRef.current) return;

                    try {
                        const detections = await faceapi
                            .detectAllFaces(
                                videoRef.current,
                                new faceapi.TinyFaceDetectorOptions({
                                    inputSize: 320,
                                    scoreThreshold: 0.5
                                })
                            )
                            .withFaceLandmarks();

                        const ctx = canvasRef.current.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                        }

                        if (detections.length === 1) {
                            const dims = {
                                width: videoRef.current.videoWidth,
                                height: videoRef.current.videoHeight,
                            };
                            const resizedDetections = faceapi.resizeResults(detections, dims);
                            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                            onFaceDetected(true);
                        } else {
                            onFaceDetected(false);
                        }

                        // Continue detection loop
                        requestAnimationFrame(detectFaces);
                    } catch (error) {
                        console.error('Face detection error:', error);
                        requestAnimationFrame(detectFaces);
                    }
                };

                detectFaces();
            } catch (err) {
                console.error("Error in face detection:", err);
            }
        };

        startVideo();

        return () => {
            mounted = false;
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onVideoReady, onCanvasReady, onFaceDetected]);

    return (
        <div className="relative w-full max-w-4xl mx-auto aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
            )}
            <video
                ref={videoRef}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                    isVideoLoading ? 'opacity-0' : 'opacity-100'
                }`}
                playsInline
                muted
                autoPlay
                style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute top-4 right-4 space-y-2 z-10">
                <div
                    className={`px-3 py-1 rounded-full text-sm ${
                        isCameraReady ? 'bg-green-500' : 'bg-red-500'
                    } text-white shadow-lg transition-colors duration-300`}
                >
                    {isCameraReady ? '📸 Kamera Aktif' : '❌ Kamera Tidak Aktif'}
                </div>
                <div
                    className={`px-3 py-1 rounded-full text-sm ${
                        hasFaceDetected ? 'bg-green-500' : 'bg-yellow-500'
                    } text-white shadow-lg transition-colors duration-300`}
                >
                    {hasFaceDetected ? '😊 Wajah Terdeteksi' : '🔍 Mencari Wajah...'}
                </div>
            </div>
        </div>
    );
};

export default VideoComponent;
