import { useState, useCallback } from 'react';

/**
 * useVersioning - Hook for managing document versions
 * 
 * Returns:
 * - versions: List of saved versions
 * - currentVersion: Current version index
 * - saveVersion: Save current content as new version
 * - restoreVersion: Restore a specific version
 * - canUndo: Whether undo is available
 * - canRedo: Whether redo is available
 * 
 * Usage:
 * const { versions, saveVersion, restoreVersion } = useVersioning();
 */
const useVersioning = () => {
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(-1);

  const saveVersion = useCallback((content, metadata = {}) => {
    const newVersion = {
      id: Date.now(),
      content,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    setVersions(prev => {
      // If we're not at the latest version, remove all versions after current
      const updatedVersions = currentVersion < prev.length - 1 
        ? prev.slice(0, currentVersion + 1) 
        : prev;
      
      return [...updatedVersions, newVersion];
    });

    setCurrentVersion(prev => prev + 1);

    return newVersion;
  }, [currentVersion]);

  const restoreVersion = useCallback((versionIndex) => {
    if (versionIndex >= 0 && versionIndex < versions.length) {
      setCurrentVersion(versionIndex);
      return versions[versionIndex];
    }
    return null;
  }, [versions]);

  const undo = useCallback(() => {
    if (currentVersion > 0) {
      const newIndex = currentVersion - 1;
      setCurrentVersion(newIndex);
      return versions[newIndex];
    }
    return null;
  }, [currentVersion, versions]);

  const redo = useCallback(() => {
    if (currentVersion < versions.length - 1) {
      const newIndex = currentVersion + 1;
      setCurrentVersion(newIndex);
      return versions[newIndex];
    }
    return null;
  }, [currentVersion, versions]);

  return {
    versions,
    currentVersion,
    saveVersion,
    restoreVersion,
    undo,
    redo,
    canUndo: currentVersion > 0,
    canRedo: currentVersion < versions.length - 1,
  };
};

export default useVersioning;
