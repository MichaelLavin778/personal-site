import { type PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { fetchPublicS3Blob } from '../loaders/S3FileDownloader'


interface ResumeState {
    url?: string
    loading: boolean
    error?: string | null
}

const initialState: ResumeState = {
    url: undefined,
    loading: false,
    error: null,
}

export const loadResume = createAsyncThunk<
    string,
    undefined,
    { rejectValue: string }
>('resume/resume', async (_, thunkAPI) => {
    try {
        const blob = await fetchPublicS3Blob('personal--site', 'resume.pdf');
        if (!blob) {
            throw Error('Failed to download resume');
        }
        const objectUrl = URL.createObjectURL(blob);

        return objectUrl;
    } catch (err: unknown) {
        const message = (err as Error)?.message ?? String(err);
        return thunkAPI.rejectWithValue(message);
    }
})

export const resumeSlice = createSlice({
    name: 'resume',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadResume.pending, (state) => {
                state.loading = true
            })
            .addCase(loadResume.fulfilled, (state, action: PayloadAction<string>) => {
                state.url = action.payload
                state.loading = false
            })
            .addCase(loadResume.rejected, (state, action) => {
                state.error = (action.payload as string) ?? action.error?.message ?? 'Failed'
                state.loading = false
            })
    },
})

export const selectResumeUrl = (state: RootState) => state.resume?.url as string | undefined
export const selectResumeLoading = (state: RootState) => state.resume?.loading as boolean
export const selectResumeError = (state: RootState) => state.resume?.error as string | null

export default resumeSlice.reducer
