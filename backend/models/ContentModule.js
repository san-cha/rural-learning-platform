// backend/models/ContentModule.js

import mongoose from 'mongoose';

const ContentModuleSchema = new mongoose.Schema({
    // Fields needed for the Admin Content Dashboard view
    title: {
        type: String,
        required: true,
        trim: true
    },
    localizationStatus: {
        type: String,
        required: true,
        // Match the statuses shown in your UI (All Localized, Needs Marathi, English Only)
        enum: ['All Localized', 'Needs Marathi', 'English Only', 'Needs Translation'], 
        default: 'English Only'
    },
    offlineDownloads: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        // Match the statuses shown in your UI (Live, Draft)
        enum: ['Draft', 'Live', 'Archived'],
        default: 'Draft'
    },
    
    // Add any other core content fields
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ContentModule = mongoose.model('ContentModule', ContentModuleSchema);

export default ContentModule;