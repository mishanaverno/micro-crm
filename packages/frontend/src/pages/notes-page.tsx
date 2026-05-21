import { FormEvent, useEffect, useMemo, useState } from 'react';
import { NotesDataTable } from '../components/notes-data-table';
import { TablePagination } from '../components/table-pagination';
import { useClients } from '../features/clients/use-clients';
import { useCreateNote } from '../features/notes/use-create-note';
import { useDeleteNote } from '../features/notes/use-delete-note';
import { usePaginatedNotes } from '../features/notes/use-paginated-notes';
import { useUpdateNote } from '../features/notes/use-update-note';
import { useOrders } from '../features/orders/use-orders';
import { Button } from '../shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../shared/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../shared/ui/dropdown-menu';
import { Label } from '../shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../shared/ui/select';
import { Textarea } from '../shared/ui/textarea';
import { NoteRecord } from '../shared/types/note';
import { t } from '../shared/lib/i18n';

const initialFormState = {
  client_id: '',
  order_id: '',
  content: '',
};

const NOTES_TABLE_COLUMNS_STORAGE_KEY = 'notes-table-visible-columns';

const defaultVisibleColumns = {
  client: true,
  order: false,
  content: true,
  created_at: false,
  updated_at: false,
};

type VisibleColumns = typeof defaultVisibleColumns;

export function NotesPage() {
  const [form, setForm] = useState(initialFormState);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<NoteRecord | null>(null);
  const [notesPage, setNotesPage] = useState(1);
  const [notesPageSize, setNotesPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>(() => {
    if (typeof window === 'undefined') {
      return defaultVisibleColumns;
    }

    const storedValue = window.localStorage.getItem(NOTES_TABLE_COLUMNS_STORAGE_KEY);

    if (!storedValue) {
      return defaultVisibleColumns;
    }

    try {
      const parsedValue = JSON.parse(storedValue);

      return {
        ...defaultVisibleColumns,
        ...parsedValue,
      };
    } catch {
      return defaultVisibleColumns;
    }
  });

  const clientsQuery = useClients();
  const ordersQuery = useOrders();
  const notesQuery = usePaginatedNotes({ page: notesPage, pageSize: notesPageSize });
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const mutationError = createNote.error ?? updateNote.error ?? deleteNote.error;
  const notes = notesQuery.data?.items ?? [];
  const notesTotal = notesQuery.data?.total ?? 0;

  useEffect(() => {
    window.localStorage.setItem(
      NOTES_TABLE_COLUMNS_STORAGE_KEY,
      JSON.stringify(visibleColumns),
    );
  }, [visibleColumns]);

  useEffect(() => {
    const pageCount = Math.max(1, Math.ceil(notesTotal / notesPageSize));

    if (notesPage > pageCount) {
      setNotesPage(pageCount);
    }
  }, [notesPage, notesPageSize, notesTotal]);

  const clientOptions = clientsQuery.data ?? [];
  const orderOptions = useMemo(
    () =>
      (ordersQuery.data ?? []).filter((order) =>
        form.client_id ? order.client_id === form.client_id : true,
      ),
    [form.client_id, ordersQuery.data],
  );

  useEffect(() => {
    if (!isNoteDialogOpen || editingNote || form.client_id || clientOptions.length === 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      client_id: clientOptions[0].id,
    }));
  }, [clientOptions, editingNote, form.client_id, isNoteDialogOpen]);

  useEffect(() => {
    if (!form.order_id) {
      return;
    }

    const hasSelectedOrder = orderOptions.some((order) => order.id === form.order_id);

    if (!hasSelectedOrder) {
      setForm((current) => ({
        ...current,
        order_id: '',
      }));
    }
  }, [form.order_id, orderOptions]);

  const clientLabels = useMemo(() => {
    return new Map(
      clientOptions.map((client) => [
        client.id,
        client.name || client.email || client.id,
      ]),
    );
  }, [clientOptions]);

  function resolveClientLabel(clientId: string) {
    return clientLabels.get(clientId) ?? clientId;
  }

  function resolveOrderLabel(orderId: number | null | undefined) {
    if (!orderId) {
      return '—';
    }

    const order = (ordersQuery.data ?? []).find((item) => Number(item.id) === orderId);

    if (!order) {
      return `#${orderId}`;
    }

    return `#${order.id} — ${order.title || t('empty.orderTitle')}`;
  }

  function toggleColumn(column: keyof VisibleColumns) {
    setVisibleColumns((current: VisibleColumns) => ({
      ...current,
      [column]: !current[column],
    }));
  }

  function openCreateDialog() {
    createNote.reset();
    updateNote.reset();
    setEditingNote(null);
    setForm({
      client_id: clientOptions[0]?.id ?? '',
      order_id: '',
      content: '',
    });
    setIsNoteDialogOpen(true);
  }

  function openEditDialog(note: NoteRecord) {
    createNote.reset();
    updateNote.reset();
    setEditingNote(note);
    setForm({
      client_id: note.client_id,
      order_id: note.order_id ? String(note.order_id) : '',
      content: note.content,
    });
    setIsNoteDialogOpen(true);
  }

  function closeDialog() {
    setIsNoteDialogOpen(false);
    setEditingNote(null);
    setForm(initialFormState);
    createNote.reset();
    updateNote.reset();
  }

  function openDeleteDialog(note: NoteRecord) {
    deleteNote.reset();
    setNoteToDelete(note);
  }

  function closeDeleteDialog() {
    if (deleteNote.isPending) {
      return;
    }

    setNoteToDelete(null);
    deleteNote.reset();
  }

  async function handleConfirmDelete() {
    if (!noteToDelete) {
      return;
    }

    await deleteNote.mutateAsync(noteToDelete.id);
    setNoteToDelete(null);
    deleteNote.reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      client_id: form.client_id,
      order_id: form.order_id ? Number(form.order_id) : null,
      content: form.content,
    };

    if (editingNote) {
      await updateNote.mutateAsync({
        noteId: editingNote.id,
        payload,
      });
    } else {
      await createNote.mutateAsync(payload);
    }

    closeDialog();
  }

  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>{t('page.notes')}</CardTitle>
              <CardDescription>
                {t('dialog.noteCreateDescription')}
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="secondary">
                    {t('common.columns')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{t('columns.toggle')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.client}
                    onCheckedChange={() => toggleColumn('client')}
                  >
                    {t('common.client')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.order}
                    onCheckedChange={() => toggleColumn('order')}
                  >
                    {t('common.order')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.content}
                    onCheckedChange={() => toggleColumn('content')}
                  >
                    {t('common.content')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.created_at}
                    onCheckedChange={() => toggleColumn('created_at')}
                  >
                    {t('common.createdAt')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={visibleColumns.updated_at}
                    onCheckedChange={() => toggleColumn('updated_at')}
                  >
                    {t('common.updatedAt')}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>{t('actions.create')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingNote ? t('dialog.editNoteTitle') : t('dialog.newNoteTitle')}
                    </DialogTitle>
                    <DialogDescription>
                      {editingNote
                        ? t('dialog.noteEditDescription')
                        : t('dialog.noteCreateDescription')}
                    </DialogDescription>
                  </DialogHeader>

                  <form className="grid gap-4" id="create-note-form" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="client_id">{t('common.client')}</Label>
                      <Select
                        disabled={clientsQuery.isLoading || clientOptions.length === 0}
                        value={form.client_id || undefined}
                        onValueChange={(value) =>
                          setForm((current) => ({ ...current, client_id: value }))
                        }
                      >
                        <SelectTrigger id="client_id">
                          <SelectValue
                            placeholder={
                              clientsQuery.isLoading
                                ? t('placeholder.loadingClients')
                                : t('placeholder.selectClient')
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {clientOptions.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {resolveClientLabel(client.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="order_id">{t('common.order')}</Label>
                      <Select
                        disabled={ordersQuery.isLoading || !form.client_id}
                        value={form.order_id || '__none__'}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            order_id: value === '__none__' ? '' : value,
                          }))
                        }
                      >
                        <SelectTrigger id="order_id">
                          <SelectValue placeholder={t('placeholder.noOrder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">{t('placeholder.noOrder')}</SelectItem>
                          {orderOptions.map((order) => (
                            <SelectItem key={order.id} value={String(order.id)}>
                              {resolveOrderLabel(Number(order.id))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="content">{t('common.content')}</Label>
                      <Textarea
                        id="content"
                        required
                        value={form.content}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, content: event.target.value }))
                        }
                      />
                    </div>
                  </form>

                  <DialogFooter>
                    <Button onClick={closeDialog} type="button" variant="ghost">
                      {t('actions.cancel')}
                    </Button>
                    <Button
                      disabled={
                        createNote.isPending ||
                        updateNote.isPending ||
                        clientOptions.length === 0 ||
                        !form.client_id
                      }
                      form="create-note-form"
                      type="submit"
                    >
                      {createNote.isPending || updateNote.isPending
                        ? t('actions.saving')
                        : editingNote
                          ? t('actions.save')
                          : t('actions.save')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={Boolean(noteToDelete)}
                onOpenChange={(open) => {
                  if (!open) {
                    closeDeleteDialog();
                  }
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('dialog.deleteNoteTitle')}</DialogTitle>
                    <DialogDescription>
                      {noteToDelete
                        ? t('dialog.noteDeleteNamedDescription', undefined, {
                            name: resolveClientLabel(noteToDelete.client_id),
                          })
                        : t('dialog.noteDeleteDescription')}
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      disabled={deleteNote.isPending}
                      onClick={closeDeleteDialog}
                      type="button"
                      variant="ghost"
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button
                      className="bg-rose-600 text-white hover:bg-rose-700"
                      disabled={deleteNote.isPending}
                      onClick={() => void handleConfirmDelete()}
                      type="button"
                    >
                      {deleteNote.isPending ? t('actions.deleting') : t('actions.delete')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {mutationError ? (
            <p className="mb-4 text-sm text-rose-700">
              {mutationError.message || t('feedback.noteSaveFailed')}
            </p>
          ) : null}

          {notesQuery.isLoading || clientsQuery.isLoading || ordersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('placeholder.loadingNotes')}</p>
          ) : notesQuery.isError ? (
            <p className="text-sm text-rose-700">{t('feedback.notesLoadFailed')}</p>
          ) : notes.length > 0 ? (
            <>
              <NotesDataTable
                notes={notes}
                onDeleteNote={openDeleteDialog}
                onEditNote={openEditDialog}
                resolveClientLabel={resolveClientLabel}
                resolveOrderLabel={resolveOrderLabel}
                visibleColumns={visibleColumns}
              />
              <TablePagination
                page={notesPage}
                pageSize={notesPageSize}
                totalItems={notesTotal}
                onPageChange={setNotesPage}
                onPageSizeChange={(pageSize) => {
                  setNotesPageSize(pageSize);
                  setNotesPage(1);
                }}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('empty.notes')}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
