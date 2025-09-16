import { useState, useCallback } from 'react';

export interface UseModalHandlersReturn {
  isCreateTaskModalOpen: boolean;
  isCreateHabitModalOpen: boolean;
  isCreateGoalModalOpen: boolean;
  isCreateJournalModalOpen: boolean;
  openCreateTaskModal: () => void;
  closeCreateTaskModal: () => void;
  openCreateHabitModal: () => void;
  closeCreateHabitModal: () => void;
  openCreateGoalModal: () => void;
  closeCreateGoalModal: () => void;
  openCreateJournalModal: () => void;
  closeCreateJournalModal: () => void;
  closeAllModals: () => void;
}

const useModalHandlers = (): UseModalHandlersReturn => {
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreateHabitModalOpen, setIsCreateHabitModalOpen] = useState(false);
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
  const [isCreateJournalModalOpen, setIsCreateJournalModalOpen] = useState(false);

  const openCreateTaskModal = useCallback(() => {
    setIsCreateTaskModalOpen(true);
  }, []);

  const closeCreateTaskModal = useCallback(() => {
    setIsCreateTaskModalOpen(false);
  }, []);

  const openCreateHabitModal = useCallback(() => {
    setIsCreateHabitModalOpen(true);
  }, []);

  const closeCreateHabitModal = useCallback(() => {
    setIsCreateHabitModalOpen(false);
  }, []);

  const openCreateGoalModal = useCallback(() => {
    setIsCreateGoalModalOpen(true);
  }, []);

  const closeCreateGoalModal = useCallback(() => {
    setIsCreateGoalModalOpen(false);
  }, []);

  const openCreateJournalModal = useCallback(() => {
    setIsCreateJournalModalOpen(true);
  }, []);

  const closeCreateJournalModal = useCallback(() => {
    setIsCreateJournalModalOpen(false);
  }, []);

  const closeAllModals = useCallback(() => {
    setIsCreateTaskModalOpen(false);
    setIsCreateHabitModalOpen(false);
    setIsCreateGoalModalOpen(false);
    setIsCreateJournalModalOpen(false);
  }, []);

  return {
    isCreateTaskModalOpen,
    isCreateHabitModalOpen,
    isCreateGoalModalOpen,
    isCreateJournalModalOpen,
    openCreateTaskModal,
    closeCreateTaskModal,
    openCreateHabitModal,
    closeCreateHabitModal,
    openCreateGoalModal,
    closeCreateGoalModal,
    openCreateJournalModal,
    closeCreateJournalModal,
    closeAllModals,
  };
};

export default useModalHandlers;