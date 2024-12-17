'use client';

import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { BiCamera } from 'react-icons/bi';
import { useAuth } from '@/context/AuthContext';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { Suspense } from 'react';

// Dynamic imports untuk komponen
const VideoComponent = dynamic(() => import('@/components/VideoComponent'), {
    ssr: false,
    loading: () => <LoadingFallback />
});
const LoadingFallback = dynamic(() => import('@/components/LoadingFallback'));

// Constants
const MODEL_URL = '/models';
const REQUIRED_IMAGES = 24; // 8 angles × 3 images per angle
const MIN_CONFIDENCE = 0.6;

interface TrainingState {
    capturedImages: string[];
    currentAngle: number;
    isComplete: boolean;
}

interface ErrorState {
    message: string;
    type: 'error' | 'warning' | null;
}

export default function RegisterFaceRecognition() {
    const router = useRouter();
    const { user, updateUser } = useAuth();

    // State
    const [step, setStep] = useState<'initial' | 'training' | 'processing'>('initial');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorState>({ message: '', type: null });
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [hasFaceDetected, setHasFaceDetected] = useState(false);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
    const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
    const [trainingState, setTrainingState] = useState<TrainingState>({
        capturedImages: [],
        currentAngle: 0,
        isComplete: false
    });

    // Load models on mount
    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/registerfacerecognition');
            return;
        }

        loadModels();

        return () => {
            // Cleanup
            if (videoElement?.srcObject instanceof MediaStream) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [user, router]);

// Di page.tsx, update loadModels
    const loadModels = async () => {
        try {
            setLoading(true);
            console.log('Loading face-api models...');

            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
            ]);

            console.log('Models loaded successfully');
            setModelsLoaded(true);
            toast.success('Model wajah berhasil dimuat');
        } catch (error) {
            console.error('Error loading models:', error);
            handleError(error, 'Gagal memuat model wajah');
        } finally {
            setLoading(false);
        }
    };


    const handleVideoReady = (video: HTMLVideoElement) => {
        setVideoElement(video);
    };

    const handleFaceDetected = (detected: boolean) => {
        setHasFaceDetected(detected);
    };

    const handleCanvasReady = (canvas: HTMLCanvasElement) => {
        setCanvasElement(canvas);
        setIsCameraReady(true);
    };

    const captureImage = async () => {
        if (!videoElement || !canvasElement || !hasFaceDetected) return;

        try {
            const detections = await faceapi
                .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            if (detections.length !== 1) {
                toast.warning('Pastikan hanya satu wajah yang terdeteksi');
                return;
            }

            const context = canvasElement.getContext('2d');
            if (!context) return;

            // Capture image
            context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
            const imageData = canvasElement.toDataURL('image/jpeg');

            // Update training state
            setTrainingState(prev => {
                const newImages = [...prev.capturedImages, imageData];
                return {
                    ...prev,
                    capturedImages: newImages,
                    isComplete: newImages.length >= REQUIRED_IMAGES
                };
            });

            toast.success(`Gambar ${trainingState.capturedImages.length + 1} berhasil diambil`);

        } catch (error) {
            handleError(error, 'Gagal mengambil gambar');
        }
    };

    const handleSubmitTraining = async () => {
        if (!trainingState.isComplete) return;

        try {
            setStep('processing');
            const formData = new FormData();

            trainingState.capturedImages.forEach((image, index) => {
                const blob = dataURItoBlob(image);
                formData.append(`image${index}`, blob);
            });

            formData.append('userId', user?.id || '');

            const response = await axios.post('/api/register-face', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                toast.success('Registrasi wajah berhasil!');
                updateUser({ ...user!, hasFaceRegistration: true });
                setTimeout(() => router.push('/dashboard'), 2000);
            }
        } catch (error) {
            handleError(error, 'Gagal menyimpan data wajah');
        } finally {
            setStep('training');
        }
    };

    const handleError = (error: any, defaultMessage: string) => {
        console.error(error);
        const message = error instanceof Error ? error.message : defaultMessage;
        setError({ message, type: 'error' });
        toast.error(message);
    };

    const dataURItoBlob = (dataURI: string): Blob => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6">Registrasi Face Recognition</h2>

                    {/* User Info */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Nama: {user.username}</p>
                        <p className="text-sm text-gray-600">Email: {user.email}</p>
                    </div>

                    {/* Error Display */}
                    {error.type && (
                        <div className={`p-4 rounded-md mb-4 ${
                            error.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            <p>{error.message}</p>
                        </div>
                    )}

                    {/* Main Content */}
                    {step === 'initial' && (
                        <div className="text-center">
                            <BiCamera className="mx-auto text-6xl text-blue-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-4">Mulai Registrasi Wajah</h3>
                            <p className="text-gray-600 mb-6">
                                Pastikan Anda berada di ruangan dengan pencahayaan yang baik dan wajah terlihat jelas
                            </p>
                            <button
                                onClick={() => setStep('training')}
                                disabled={!modelsLoaded || loading}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                                         disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Memuat...' : 'Mulai'}
                            </button>
                        </div>
                    )}

                    {step === 'training' && (
                        <div className="space-y-4">
                            <Suspense fallback={<LoadingFallback />}>
                                <VideoComponent
                                    onVideoReady={handleVideoReady}
                                    onCanvasReady={handleCanvasReady}
                                    isCameraReady={isCameraReady}
                                    hasFaceDetected={hasFaceDetected}
                                    onFaceDetected={handleFaceDetected}
                                />
                            </Suspense>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Progress:</span>
                                    <span>{Math.round((trainingState.capturedImages.length / REQUIRED_IMAGES) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${(trainingState.capturedImages.length / REQUIRED_IMAGES) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={captureImage}
                                    disabled={!hasFaceDetected || trainingState.isComplete}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600
                                             disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Ambil Gambar
                                </button>

                                <button
                                    onClick={handleSubmitTraining}
                                    disabled={!trainingState.isComplete}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600
                                             disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Selesai
                                </button>
                            </div>

                            {/* Captured Images Preview */}
                            {trainingState.capturedImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {trainingState.capturedImages.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`Training ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-md"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'processing' && <LoadingFallback />}
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}
