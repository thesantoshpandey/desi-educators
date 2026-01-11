'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
    const [settingsId, setSettingsId] = useState<string | null>(null);
    const [siteName, setSiteName] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    const [supportPhone, setSupportPhone] = useState('');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*')
                .limit(1) // Get the first row
                .single();

            if (error) throw error;

            if (data) {
                setSettingsId(data.id);
                setSiteName(data.site_name);
                setSupportEmail(data.support_email);
                setSupportPhone(data.support_phone || '');
                setMaintenanceMode(data.maintenance_mode);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // alert('Failed to load settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settingsId) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('platform_settings')
                .update({
                    site_name: siteName,
                    support_email: supportEmail,
                    support_phone: supportPhone,
                    maintenance_mode: maintenanceMode,
                    updated_at: new Date().toISOString()
                })
                .eq('id', settingsId);

            if (error) throw error;
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '24px' }}>Loading settings...</div>;
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>Platform Settings</h1>

            <div style={{ display: 'grid', gap: '24px', maxWidth: '800px' }}>
                {/* General Settings */}
                <Card padding="lg">
                    <h3 style={{ marginBottom: '16px' }}>General Configuration</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <Input
                            label="Site Name"
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value)}
                        />
                        <Input
                            label="Support Contact Email"
                            value={supportEmail}
                            onChange={(e) => setSupportEmail(e.target.value)}
                        />
                        <Input
                            label="Support Contact Phone"
                            value={supportPhone}
                            onChange={(e) => setSupportPhone(e.target.value)}
                        />
                    </div>
                </Card>

                {/* Privacy & Security */}
                <Card padding="lg">
                    <h3 style={{ marginBottom: '16px' }}>Privacy & Maintenance</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                        <div>
                            <p style={{ fontWeight: 500 }}>Maintenance Mode</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Disable public access to the site</p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={maintenanceMode}
                                onChange={() => setMaintenanceMode(!maintenanceMode)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </Card>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
