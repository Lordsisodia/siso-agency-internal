import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useBulkImport } from '@/hooks/useBulkImport';
import { ImportProgress } from './ImportProgress';
import { ValidationErrors } from '../ValidationErrors';

type ImportMode = 'skip' | 'update' | 'merge' | 'fail';

export const ColumnBasedImport = () => {
  const [usernames, setUsernames] = useState('');
  const [followers, setFollowers] = useState('');
  const [following, setFollowing] = useState('');
  const [posts, setPosts] = useState('');
  const [fullNames, setFullNames] = useState('');
  const [bios, setBios] = useState('');
  const [profileUrls, setProfileUrls] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('skip');
  
  const {
    isProcessing,
    importProgress,
    validationErrors,
    processImport,
  } = useBulkImport();

  const handleImport = useCallback(async () => {
    // Split by newlines and remove empty lines
    const cleanAndSplit = (str: string) => str.split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const usernameList = cleanAndSplit(usernames);
    if (!usernameList.length) {
      toast.error('Please add at least one username');
      return;
    }

    // Create a map to track duplicate usernames
    const usernameCounts = new Map<string, number>();
    const duplicates = new Set<string>();

    usernameList.forEach(username => {
      const normalized = username.toLowerCase();
      usernameCounts.set(normalized, (usernameCounts.get(normalized) || 0) + 1);
      if (usernameCounts.get(normalized)! > 1) {
        duplicates.add(username);
      }
    });

    // Handle duplicates based on import mode
    if (duplicates.size > 0) {
      if (importMode === 'fail') {
        toast.error(`Found duplicate usernames: ${Array.from(duplicates).join(', ')}`);
        return;
      }
      
      if (importMode !== 'skip' && importMode !== 'update') {
        // For merge mode, we'll keep only one instance of each username
        const seen = new Set<string>();
        usernameList.forEach((username, index) => {
          const normalized = username.toLowerCase();
          if (seen.has(normalized)) {
            // Mark duplicate indices for removal
            usernameList[index] = '';
          } else {
            seen.add(normalized);
          }
        });
      }
    }

    const followersList = cleanAndSplit(followers);
    const followingList = cleanAndSplit(following);
    const postsList = cleanAndSplit(posts);
    const fullNamesList = cleanAndSplit(fullNames);
    const biosList = cleanAndSplit(bios);
    const profileUrlsList = cleanAndSplit(profileUrls);

    // Convert strings to numbers or null for numeric fields
    const parseNumber = (str: string) => {
      const num = Number(str);
      return isNaN(num) ? null : num;
    };

    const leads = usernameList
      .filter(Boolean) // Remove empty usernames (from merge mode)
      .map((username, index) => ({
        username,
        followers_count: followersList[index] ? parseNumber(followersList[index]) : null,
        following_count: followingList[index] ? parseNumber(followingList[index]) : null,
        posts_count: postsList[index] ? parseNumber(postsList[index]) : null,
        full_name: fullNamesList[index] || null,
        bio: biosList[index] || null,
        profile_url: profileUrlsList[index] || null,
      }));

    const success = await processImport(leads, importMode);
    if (success) {
      // Clear all inputs after successful import
      setUsernames('');
      setFollowers('');
      setFollowing('');
      setPosts('');
      setFullNames('');
      setBios('');
      setProfileUrls('');
      
      if (duplicates.size > 0) {
        toast.success(`Import completed. ${duplicates.size} duplicate(s) were ${importMode === 'skip' ? 'skipped' : importMode === 'update' ? 'updated' : 'merged'}`);
      } else {
        toast.success('Import completed successfully');
      }
    }
  }, [usernames, followers, following, posts, fullNames, bios, profileUrls, processImport, importMode]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label>Import Mode</Label>
          <RadioGroup
            defaultValue={importMode}
            onValueChange={(value) => setImportMode(value as ImportMode)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="skip" id="skip" />
              <Label htmlFor="skip">Skip duplicates (default)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="update" id="update" />
              <Label htmlFor="update">Update existing leads</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="merge" id="merge" />
              <Label htmlFor="merge">Merge duplicates (combine data)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fail" id="fail" />
              <Label htmlFor="fail">Fail if duplicates found</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usernames" className="font-medium">
            Usernames (required)
          </Label>
          <Textarea
            id="usernames"
            placeholder="Enter usernames, one per line"
            value={usernames}
            onChange={(e) => setUsernames(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="followers" className="font-medium">
            Followers Count
          </Label>
          <Textarea
            id="followers"
            placeholder="Enter follower counts, one per line"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="following" className="font-medium">
            Following Count
          </Label>
          <Textarea
            id="following"
            placeholder="Enter following counts, one per line"
            value={following}
            onChange={(e) => setFollowing(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="posts" className="font-medium">
            Posts Count
          </Label>
          <Textarea
            id="posts"
            placeholder="Enter post counts, one per line"
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullNames" className="font-medium">
            Full Names
          </Label>
          <Textarea
            id="fullNames"
            placeholder="Enter full names, one per line"
            value={fullNames}
            onChange={(e) => setFullNames(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bios" className="font-medium">
            Bios
          </Label>
          <Textarea
            id="bios"
            placeholder="Enter bios, one per line"
            value={bios}
            onChange={(e) => setBios(e.target.value)}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profileUrls" className="font-medium">
            Profile URLs
          </Label>
          <Textarea
            id="profileUrls"
            placeholder="Enter profile URLs, one per line"
            value={profileUrls}
            onChange={(e) => setProfileUrls(e.target.value)}
            className="font-mono"
          />
        </div>
      </div>

      <ValidationErrors errors={validationErrors} />
      
      <ImportProgress 
        isProcessing={isProcessing}
        importProgress={importProgress}
      />

      <Button
        onClick={handleImport}
        disabled={isProcessing || !usernames.trim()}
        className="w-full"
      >
        Import Leads
      </Button>
    </div>
  );
};
