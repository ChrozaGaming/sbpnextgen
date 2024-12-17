const loadRegisteredFaces = async () => {
    try {
        const response = await axios.get('/api/registered-faces');
        const users = response.data.users || [];

        if (users.length === 0) {
            toast.warning('Belum ada data wajah yang terdaftar');
            return;
        }

        const labeledFaces = await Promise.all(users.map(async (user: any) => {
            try {
                // Pastikan user.face_images adalah array
                const faceImages = Array.isArray(user.face_images) ? user.face_images : [];

                const descriptions = await Promise.all(
                    faceImages.map(async (imagePath: string) => {
                        try {
                            const img = await faceapi.fetchImage(`/${imagePath}`);
                            const detection = await faceapi.detectSingleFace(img)
                                .withFaceLandmarks()
                                .withFaceDescriptor();
                            return detection?.descriptor;
                        } catch (error) {
                            console.error(`Error processing image ${imagePath}:`, error);
                            return undefined;
                        }
                    })
                );

                // Filter out undefined descriptors
                const validDescriptions = descriptions.filter((desc: any) => desc !== undefined);

                if (validDescriptions.length === 0) {
                    console.warn(`No valid descriptions found for user ${user.email}`);
                    return null;
                }

                return new faceapi.LabeledFaceDescriptors(
                    user.email,
                    validDescriptions
                );
            } catch (error) {
                console.error(`Error processing user ${user.email}:`, error);
                return null;
            }
        }));

        // Filter out null values and set to state
        const validLabeledFaces = labeledFaces.filter(face => face !== null);
        setLabeledDescriptors(validLabeledFaces);

        if (validLabeledFaces.length === 0) {
            toast.warning('Tidak ada data wajah yang valid untuk diproses');
        } else {
            toast.success(`Berhasil memuat ${validLabeledFaces.length} data wajah`);
        }

    } catch (error) {
        console.error('Error loading registered faces:', error);
        toast.error('Gagal memuat data wajah terdaftar');
        setLabeledDescriptors([]);
    }
};
