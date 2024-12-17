'use client';

import { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as faceapi from 'face-api.js';
import axios from 'axios';

interface DetectedFace {
    id: number;
    nama: string;
    email: string;
    confidence: number;
}

export default function CheckDetectionFace() {
    const [loading, setLoading] = useState(true);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [detectedFace, setDetectedFace] = useState<DetectedFace | null>(null);
    const [checking, setChecking] = useState(false);


    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectionInterval = useRef<NodeJS.Timeout>();

    useEffect(() => {
        loadModels();
        return () => stopStream();
    }, []);

    const loadModels = async () => {
        try {
            setLoading(true);
            const MODEL_URL = '/models';

            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
            ]);

            setModelsLoaded(true);
            toast.success('Model wajah berhasil dimuat');
            startCamera();
        } catch (error) {
            console.error('Error loading models:', error);
            toast.error('Gagal memuat model wajah');
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                await videoRef.current.play();
                startFaceDetection();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            toast.error('Gagal mengakses kamera');
        }
    };

    const startFaceDetection = () => {
        if (!videoRef.current || !canvasRef.current) return;

        detectionInterval.current = setInterval(async () => {
            if (!checking) {
                await detectFace();
            }
        }, 1000);
    };

    const detectFace = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        try {
            setChecking(true);

            const detection = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            // Jika wajah tidak terdeteksi, hapus data yang ditampilkan
            if (!detection) {
                setDetectedFace(null); // Hapus data yang ditampilkan
                // Mengurangi frekuensi toast untuk menghindari spam
                if (Math.random() < 0.1) { // Hanya show 10% dari waktu
                    toast.info('Wajah tidak terdeteksi atau keluar dari frame');
                }
                return;
            }

            const faceDescriptor = Array.from(detection.descriptor);

            const response = await axios.post('/api/check-face', {
                faceDescriptor
            });

            if (response.data.success && response.data.data) {
                const confidence = response.data.data.confidence * 100; // Konversi ke persentase

                // Hanya tampilkan data jika confidence >= 20%
                if (confidence >= 20) {
                    setDetectedFace(response.data.data);
                } else {
                    setDetectedFace(null); // Hapus data jika confidence dibawah threshold
                }
            } else {
                setDetectedFace(null);
                // Mengurangi frekuensi toast
                if (Math.random() < 0.1) {
                    toast.info(response.data.message || 'Wajah belum terdaftar');
                }
            }

        } catch (error) {
            console.error('Face detection error:', error);
            setDetectedFace(null); // Hapus data jika terjadi error
            // Mengurangi frekuensi toast error
            if (Math.random() < 0.1) {
                toast.error('Gagal memeriksa wajah');
            }
        } finally {
            setChecking(false);
        }
    };


    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (detectionInterval.current) {
            clearInterval(detectionInterval.current);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Sistem Pengecekan Wajah
                    </h2>
                    <p className="text-center text-sm text-gray-600 mb-4">
                        Minimal tingkat kecocokan: 20%
                    </p>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
                            <p className="mt-4">Memuat model pengenalan wajah...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full"
                                />
                            </div>

                            {detectedFace && (
                                <div className="bg-green-100 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                                        Wajah Teridentifikasi
                                    </h3>
                                    <div className="space-y-1">
                                        <p><span className="font-semibold">Nama:</span> {detectedFace.nama}</p>
                                        <p><span className="font-semibold">Email:</span> {detectedFace.email}</p>
                                        <p>
                                            <span className="font-semibold">Tingkat Kecocokan:</span>{' '}
                                            <span className={`${
                                                detectedFace.confidence * 100 >= 20 ? 'text-green-600' : 'text-yellow-600'
                                            }`}>
                                            {Math.round(detectedFace.confidence * 100)}%
                                        </span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!detectedFace && !loading && (
                                <div className="text-center text-gray-600">
                                    Menunggu deteksi wajah dengan tingkat kecocokan minimal 20%...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={3}
            />
        </div>
    );
