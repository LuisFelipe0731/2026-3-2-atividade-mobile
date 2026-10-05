import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Code2,
  Home,
  ListTodo,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react-native';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const colors = {
  ink: '#0C3453',
  orange: '#CE701B',
  orangeBright: '#F1881D',
  yellow: '#FDC616',
  cream: '#F9EBC2',
  blue: '#A4BCCC',
  paper: '#FFFEFA',
  muted: '#6F7C83',
  line: '#EAE6DA',
  green: '#3D795E',
};

type Task = {
  id: string;
  title: string;
  detail: string;
  dueDate: string;
  done: boolean;
};

type TaskFilter = 'todas' | 'pendentes' | 'concluidas';

type StudentProfile = {
  name: string;
  handle: string;
  course: string;
  campus: string;
  subject: string;
  semester: string;
};

const initialProfile: StudentProfile = {
  name: 'Luis Felipe Rodrigues Freire',
  handle: '@LuisFelipe0731',
  course: 'Técnico em Informática para Internet',
  campus: 'DIATINF · IFRN Campus Natal-Central',
  subject: 'Programação orientada a serviços',
  semester: '2026.3',
};

function isStudentProfile(value: unknown): value is StudentProfile {
  if (typeof value !== 'object' || value === null) return false;
  const profile = value as Record<string, unknown>;
  return typeof profile.name === 'string'
    && typeof profile.handle === 'string'
    && typeof profile.course === 'string'
    && typeof profile.campus === 'string'
    && typeof profile.subject === 'string'
    && typeof profile.semester === 'string';
}

const initialTasks: Task[] = [
  { id: 'app', title: 'Finalizar tela inicial do app', detail: 'React Native', dueDate: '2026-10-05', done: false },
  { id: 'api', title: 'Revisar integração com a API', detail: 'Programação orientada a serviços', dueDate: '2026-10-08', done: true },
];

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const task = value as Record<string, unknown>;
  return typeof task.id === 'string'
    && typeof task.title === 'string'
    && typeof task.detail === 'string'
    && typeof task.dueDate === 'string'
    && typeof task.done === 'boolean';
}

const weekDays = [
  { day: 5, label: 'SEG', fullLabel: 'SEGUNDA-FEIRA' },
  { day: 6, label: 'TER', fullLabel: 'TERÇA-FEIRA' },
  { day: 7, label: 'QUA', fullLabel: 'QUARTA-FEIRA' },
  { day: 8, label: 'QUI', fullLabel: 'QUINTA-FEIRA' },
  { day: 9, label: 'SEX', fullLabel: 'SEXTA-FEIRA' },
  { day: 10, label: 'SÁB', fullLabel: 'SÁBADO' },
  { day: 11, label: 'DOM', fullLabel: 'DOMINGO' },
] as const;

type AgendaCategory = 'AULA' | 'ESTUDO' | 'PESSOAL';
type AgendaEntry = {
  id: string;
  day: number;
  title: string;
  start: string;
  end: string;
  place: string;
  category: AgendaCategory;
};

const initialAgenda: AgendaEntry[] = [
  {
    id: 'class-pos',
    day: 5,
    title: 'Programação orientada a serviços',
    start: '19:00',
    end: '20:40',
    place: 'Laboratório de informática · Bloco II',
    category: 'AULA',
  },
  {
    id: 'study-mobile',
    day: 5,
    title: 'Revisão do projeto mobile',
    start: '20:50',
    end: '21:30',
    place: 'Organize as próximas entregas',
    category: 'ESTUDO',
  },
];

function isAgendaEntry(value: unknown): value is AgendaEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === 'string'
    && typeof entry.day === 'number'
    && typeof entry.title === 'string'
    && typeof entry.start === 'string'
    && typeof entry.end === 'string'
    && typeof entry.place === 'string'
    && (entry.category === 'AULA' || entry.category === 'ESTUDO' || entry.category === 'PESSOAL');
}

const tabs = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'tarefas', label: 'Tarefas', icon: ListTodo },
  { id: 'perfil', label: 'Perfil', icon: CircleUserRound },
] as const;

type TabId = (typeof tabs)[number]['id'];
type ScreenId = TabId | 'notificacoes';
type NotificationItem = {
  id: string;
  category: 'aula' | 'prazo' | 'aviso';
  title: string;
  message: string;
  time: string;
  read: boolean;
  destination: Extract<TabId, 'agenda' | 'tarefas' | 'perfil'>;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 'deadline',
    category: 'prazo',
    title: 'Entrega chegando',
    message: 'Finalize a tela inicial do seu aplicativo mobile. O prazo termina hoje.',
    time: 'Há 20 min',
    read: false,
    destination: 'tarefas',
  },
  {
    id: 'class',
    category: 'aula',
    title: 'Sua próxima aula é hoje',
    message: 'Programação orientada a serviços começa às 19:00 no laboratório.',
    time: 'Há 1 hora',
    read: false,
    destination: 'agenda',
  },
  {
    id: 'welcome',
    category: 'aviso',
    title: 'Boas-vindas ao seu espaço',
    message: 'Seu painel acadêmico está pronto. Confira seus dados de perfil.',
    time: 'Ontem',
    read: true,
    destination: 'perfil',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ScreenId>('inicio');
  const [tasks, setTasks] = useState(initialTasks);
  const [tasksReady, setTasksReady] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [profileReady, setProfileReady] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedAgendaDay, setSelectedAgendaDay] = useState(5);
  const [agendaEntries, setAgendaEntries] = useState(initialAgenda);
  const [agendaReady, setAgendaReady] = useState(false);
  const completedTasks = tasks.filter((task) => task.done).length;
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const savedProfile = await AsyncStorage.getItem('@diatinf/profile');
        if (!savedProfile || !mounted) return;
        const parsedProfile: unknown = JSON.parse(savedProfile);
        if (isStudentProfile(parsedProfile)) setProfile(parsedProfile);
      } catch (error) {
        console.warn('Não foi possível carregar o perfil salvo.', error);
      } finally {
        if (mounted) setProfileReady(true);
      }
    }

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!profileReady) return;
    AsyncStorage.setItem('@diatinf/profile', JSON.stringify(profile)).catch((error) => {
      console.warn('Não foi possível salvar o perfil.', error);
    });
  }, [profile, profileReady]);

  useEffect(() => {
    let mounted = true;

    async function loadTasks() {
      try {
        const savedTasks = await AsyncStorage.getItem('@diatinf/tasks');
        if (!savedTasks || !mounted) return;
        const parsedTasks: unknown = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks) && parsedTasks.every(isTask)) {
          setTasks(parsedTasks);
        }
      } catch (error) {
        console.warn('Não foi possível carregar as tarefas salvas.', error);
      } finally {
        if (mounted) setTasksReady(true);
      }
    }

    void loadTasks();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!tasksReady) return;
    AsyncStorage.setItem('@diatinf/tasks', JSON.stringify(tasks)).catch((error) => {
      console.warn('Não foi possível salvar as tarefas.', error);
    });
  }, [tasks, tasksReady]);

  useEffect(() => {
    let mounted = true;

    async function loadAgenda() {
      try {
        const savedAgenda = await AsyncStorage.getItem('@diatinf/agenda');
        if (!savedAgenda || !mounted) return;
        const parsedAgenda: unknown = JSON.parse(savedAgenda);
        if (Array.isArray(parsedAgenda) && parsedAgenda.every(isAgendaEntry)) {
          setAgendaEntries(parsedAgenda);
        }
      } catch (error) {
        console.warn('Não foi possível carregar a agenda salva.', error);
      } finally {
        if (mounted) setAgendaReady(true);
      }
    }

    void loadAgenda();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!agendaReady) return;
    AsyncStorage.setItem('@diatinf/agenda', JSON.stringify(agendaEntries)).catch((error) => {
      console.warn('Não foi possível salvar a agenda.', error);
    });
  }, [agendaEntries, agendaReady]);

  function toggleTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }

  function addTask(task: Omit<Task, 'id' | 'done'>) {
    setTasks((currentTasks) => [
      { ...task, id: `${Date.now()}-${currentTasks.length}`, done: false },
      ...currentTasks,
    ]);
  }

  function removeTask(id: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }

  function openNotification(notification: NotificationItem) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ),
    );
    setActiveTab(notification.destination);
  }

  function addAgendaEntry(entry: Omit<AgendaEntry, 'id'>) {
    setAgendaEntries((currentEntries) => [
      ...currentEntries,
      { ...entry, id: `${Date.now()}-${currentEntries.length}` },
    ]);
  }

  function removeAgendaEntry(id: string) {
    setAgendaEntries((currentEntries) =>
      currentEntries.filter((entry) => entry.id !== id),
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      <View style={styles.appShell}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Code2 color={colors.paper} size={20} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.brandName}>diatinf</Text>
              <Text style={styles.brandCaption}>ESPAÇO DO ESTUDANTE</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Notificações, ${unreadCount} não lidas`}
            onPress={() => setActiveTab('notificacoes')}
            style={styles.iconButton}
          >
            <Bell color={colors.ink} size={20} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'inicio' && (
            <>
              <View style={styles.greetingRow}>
                <View>
                  <Text style={styles.eyebrow}>SEGUNDA-FEIRA, 05 DE OUTUBRO</Text>
                  <Text style={styles.greeting}>Olá, Luis Felipe</Text>
                  <Text style={styles.subtitle}>Seu próximo passo começa aqui.</Text>
                </View>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>LF</Text>
                </View>
              </View>

              <View style={styles.heroCard}>
                <View style={styles.heroDecorOne} />
                <View style={styles.heroDecorTwo} />
                <View style={styles.heroCopy}>
                  <View style={styles.heroTag}>
                    <Sparkles color={colors.ink} size={13} />
                    <Text style={styles.heroTagText}>SEU ESPAÇO, SEU RITMO</Text>
                  </View>
                  <Text style={styles.heroTitle}>{'Ideias que\nviram projetos.'}</Text>
                  <Text style={styles.heroBody}>{'Acompanhe suas aulas e mantenha\nseus planos em movimento.'}</Text>
                </View>
                <View style={styles.heroIcon}>
                  <Code2 color={colors.ink} size={36} strokeWidth={1.8} />
                </View>
                <View style={styles.heroFooter}>
                  <Text style={styles.heroFooterText}>CURSO TÉCNICO EM INFORMÁTICA PARA INTERNET</Text>
                  <Text style={styles.heroFooterText}>IFRN · CNAT</Text>
                </View>
              </View>

              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Seu dia</Text>
                <Pressable style={styles.textAction} onPress={() => setActiveTab('agenda')}>
                  <Text style={styles.textActionLabel}>Ver agenda</Text>
                  <ChevronRight color={colors.orange} size={17} />
                </Pressable>
              </View>

              <Pressable style={styles.classCard} onPress={() => setActiveTab('agenda')}>
                <View style={styles.classTime}>
                  <Text style={styles.classHour}>19:00</Text>
                  <Text style={styles.classPeriod}>HOJE</Text>
                </View>
                <View style={styles.classDivider} />
                <View style={styles.classInfo}>
                  <Text style={styles.classLabel}>PRÓXIMA AULA</Text>
                  <Text style={styles.className}>Programação orientada a serviços</Text>
                  <View style={styles.locationRow}>
                    <MapPin color={colors.muted} size={14} />
                    <Text style={styles.locationText}>Laboratório de informática</Text>
                  </View>
                </View>
                <ChevronRight color={colors.muted} size={18} />
              </Pressable>

              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionTitle}>Em andamento</Text>
                  <Text style={styles.sectionHint}>{completedTasks} de {tasks.length} concluídas</Text>
                </View>
                <Pressable style={styles.textAction} onPress={() => setActiveTab('tarefas')}>
                  <Text style={styles.textActionLabel}>Ver todas</Text>
                  <ChevronRight color={colors.orange} size={17} />
                </Pressable>
              </View>
              <TaskList tasks={tasks.slice(0, 2)} onToggle={toggleTask} />

              <View style={styles.quoteStrip}>
                <BookOpen color={colors.orange} size={19} />
                <Text style={styles.quoteText}>Aprender fazendo. Criar para transformar.</Text>
              </View>
            </>
          )}

          {activeTab === 'agenda' && (
            <AgendaPage
              day={selectedAgendaDay}
              entries={agendaEntries}
              onSelectDay={setSelectedAgendaDay}
              onAdd={addAgendaEntry}
              onRemove={removeAgendaEntry}
            />
          )}

          {activeTab === 'tarefas' && (
            <TasksPage
              tasks={tasks}
              completedCount={completedTasks}
              onToggle={toggleTask}
              onAdd={addTask}
              onRemove={removeTask}
            />
          )}

          {activeTab === 'perfil' && (
            <ProfilePage profile={profile} onSave={setProfile} />
          )}

          {activeTab === 'notificacoes' && (
            <NotificationPage
              notifications={notifications}
              unreadCount={unreadCount}
              onBack={() => setActiveTab('inicio')}
              onMarkAllRead={() =>
                setNotifications((currentNotifications) =>
                  currentNotifications.map((item) => ({ ...item, read: true })),
                )
              }
              onOpen={openNotification}
            />
          )}
        </ScrollView>

        <View style={styles.bottomNav}>
          {tabs.map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setActiveTab(id)}
                style={styles.navItem}
              >
                <Icon color={selected ? colors.orange : colors.muted} size={21} strokeWidth={selected ? 2.4 : 1.8} />
                <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{label}</Text>
                {selected && <View style={styles.navIndicator} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function TaskList({ tasks, onToggle }: { tasks: Task[]; onToggle: (id: string) => void }) {
  return (
    <View style={styles.taskList}>
      {tasks.map((task) => (
        <Pressable key={task.id} onPress={() => onToggle(task.id)} style={styles.taskRow}>
          <View style={[styles.checkbox, task.done && styles.checkboxDone]}>
            {task.done && <Check color={colors.paper} size={14} strokeWidth={3} />}
          </View>
          <View style={styles.taskCopy}>
            <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
            <Text style={styles.taskDetail}>{task.detail}</Text>
          </View>
          <ChevronRight color={colors.muted} size={17} />
        </Pressable>
      ))}
    </View>
  );
}

type TasksPageProps = {
  tasks: Task[];
  completedCount: number;
  onToggle: (id: string) => void;
  onAdd: (task: Omit<Task, 'id' | 'done'>) => void;
  onRemove: (id: string) => void;
};

function TasksPage({ tasks, completedCount, onToggle, onAdd, onRemove }: TasksPageProps) {
  const [filter, setFilter] = useState<TaskFilter>('todas');
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const pendingCount = tasks.length - completedCount;
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'pendentes') return !task.done;
    if (filter === 'concluidas') return task.done;
    return true;
  });
  const completionPercent = tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  function saveTask() {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      detail: detail.trim() || 'Sem matéria definida',
      dueDate: dueDate.trim(),
    });
    setTitle('');
    setDetail('');
    setDueDate('');
    setFormOpen(false);
    setFilter('todas');
  }

  return (
    <View style={styles.pageContent}>
      <Text style={styles.eyebrow}>ORGANIZE SUAS ENTREGAS</Text>
      <Text style={styles.pageTitle}>Suas tarefas</Text>
      <Text style={styles.subtitle}>{pendingCount} em aberto · {completedCount} concluídas</Text>

      <View style={styles.taskProgressTrack}>
        <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
      </View>

      <View style={styles.taskToolbar}>
        <View style={styles.taskFilters}>
          {([
            { id: 'todas', label: `Todas ${tasks.length}` },
            { id: 'pendentes', label: `A fazer ${pendingCount}` },
            { id: 'concluidas', label: `Feitas ${completedCount}` },
          ] as const).map((option) => (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === option.id }}
              onPress={() => setFilter(option.id)}
              style={[styles.taskFilter, filter === option.id && styles.taskFilterActive]}
            >
              <Text style={[styles.taskFilterLabel, filter === option.id && styles.taskFilterLabelActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFormOpen((isOpen) => !isOpen)}
          style={styles.addTaskButton}
        >
          {formOpen ? <X color={colors.paper} size={16} /> : <Plus color={colors.paper} size={16} />}
          <Text style={styles.addTaskButtonLabel}>{formOpen ? 'Fechar' : 'Criar'}</Text>
        </Pressable>
      </View>

      {formOpen && (
        <View style={styles.taskForm}>
          <Text style={styles.formTitle}>Nova tarefa</Text>
          <TextInput
            accessibilityLabel="Título da tarefa"
            maxLength={80}
            onChangeText={setTitle}
            placeholder="O que você precisa fazer?"
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            style={styles.formInput}
            value={title}
          />
          <TextInput
            accessibilityLabel="Matéria ou contexto da tarefa"
            maxLength={70}
            onChangeText={setDetail}
            placeholder="Matéria ou projeto (opcional)"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={detail}
          />
          <TextInput
            accessibilityLabel="Prazo da tarefa"
            maxLength={10}
            onChangeText={setDueDate}
            placeholder="Prazo · AAAA-MM-DD (opcional)"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={dueDate}
          />
          <Pressable
            accessibilityRole="button"
            disabled={!title.trim()}
            onPress={saveTask}
            style={[styles.saveAgendaButton, !title.trim() && styles.saveAgendaButtonDisabled]}
          >
            <Text style={styles.saveAgendaButtonLabel}>Salvar tarefa</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.listHeading}>LISTA DE TAREFAS</Text>
      {visibleTasks.length === 0 ? (
        <View style={styles.emptyAgenda}>
          <ListTodo color={colors.blue} size={25} />
          <Text style={styles.emptyAgendaTitle}>
            {filter === 'concluidas' ? 'Nada concluído ainda' : 'Nenhuma tarefa por aqui'}
          </Text>
          <Text style={styles.emptyAgendaText}>
            {filter === 'pendentes'
              ? 'Você não tem tarefas em aberto.'
              : 'Crie uma tarefa para organizar seus próximos passos.'}
          </Text>
        </View>
      ) : (
        <View style={styles.taskManagerList}>
          {visibleTasks.map((task) => (
            <View key={task.id} style={styles.taskManagerRow}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.done }}
                accessibilityLabel={`${task.done ? 'Reabrir' : 'Concluir'} tarefa ${task.title}`}
                onPress={() => onToggle(task.id)}
                style={[styles.checkbox, task.done && styles.checkboxDone]}
              >
                {task.done && <Check color={colors.paper} size={14} strokeWidth={3} />}
              </Pressable>
              <View style={styles.taskManagerCopy}>
                <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
                <Text style={styles.taskDetail}>{task.detail}</Text>
                {task.dueDate !== '' && (
                  <Text style={styles.taskDueDate}>Prazo: {formatTaskDate(task.dueDate)}</Text>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Excluir tarefa ${task.title}`}
                onPress={() => onRemove(task.id)}
                style={styles.removeTaskButton}
              >
                <Trash2 color={colors.muted} size={16} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={styles.tipCard}>
        <Sparkles color={colors.orange} size={19} />
        <Text style={styles.tipText}>Pequenos avanços também levam longe. Continue no seu ritmo.</Text>
      </View>
    </View>
  );
}

function formatTaskDate(value: string) {
  const parts = value.split('-');
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function ProfilePage({
  profile,
  onSave,
}: {
  profile: StudentProfile;
  onSave: (profile: StudentProfile) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  function updateField(field: keyof StudentProfile, value: string) {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  }

  function startEditing() {
    setDraft(profile);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(profile);
    setEditing(false);
  }

  function saveProfile() {
    if (!draft.name.trim()) return;
    onSave({
      name: draft.name.trim(),
      handle: draft.handle.trim(),
      course: draft.course.trim(),
      campus: draft.campus.trim(),
      subject: draft.subject.trim(),
      semester: draft.semester.trim(),
    });
    setEditing(false);
  }

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.pageContent}>
      <Text style={styles.eyebrow}>SEU ESPAÇO ACADÊMICO</Text>
      <Text style={styles.pageTitle}>Perfil</Text>
      {editing ? (
        <View style={styles.profileEditForm}>
          <Text style={styles.formTitle}>Editar informações</Text>
          <TextInput
            accessibilityLabel="Nome completo"
            onChangeText={(value) => updateField('name', value)}
            placeholder="Nome completo"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={draft.name}
          />
          <TextInput
            accessibilityLabel="Usuário do GitHub"
            autoCapitalize="none"
            onChangeText={(value) => updateField('handle', value)}
            placeholder="Usuário do GitHub"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={draft.handle}
          />
          <TextInput
            accessibilityLabel="Curso"
            onChangeText={(value) => updateField('course', value)}
            placeholder="Curso"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={draft.course}
          />
          <TextInput
            accessibilityLabel="Campus ou instituição"
            onChangeText={(value) => updateField('campus', value)}
            placeholder="Campus ou instituição"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={draft.campus}
          />
          <TextInput
            accessibilityLabel="Disciplina atual"
            onChangeText={(value) => updateField('subject', value)}
            placeholder="Disciplina atual"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={draft.subject}
          />
          <TextInput
            accessibilityLabel="Semestre letivo"
            onChangeText={(value) => updateField('semester', value)}
            placeholder="Semestre letivo"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={draft.semester}
          />
          <View style={styles.profileFormActions}>
            <Pressable accessibilityRole="button" onPress={cancelEditing} style={styles.cancelProfileButton}>
              <Text style={styles.cancelProfileButtonLabel}>Cancelar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!draft.name.trim()}
              onPress={saveProfile}
              style={[styles.saveProfileButton, !draft.name.trim() && styles.saveAgendaButtonDisabled]}
            >
              <Check color={colors.paper} size={16} />
              <Text style={styles.saveProfileButtonLabel}>Salvar perfil</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{initials}</Text></View>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileHandle}>{profile.handle}</Text>
            <View style={styles.profileDivider} />
            <Text style={styles.profileCourse}>{profile.course.toUpperCase()}</Text>
            <Text style={styles.profileSchool}>{profile.campus}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={startEditing} style={styles.editProfileButton}>
            <Pencil color={colors.orange} size={16} />
            <Text style={styles.editProfileButtonLabel}>Editar perfil</Text>
          </Pressable>
          <View style={styles.profileInfoRow}>
            <BookOpen color={colors.orange} size={19} />
            <Text style={styles.profileInfoText}>{profile.subject}</Text>
          </View>
          <View style={styles.profileInfoRow}>
            <Clock3 color={colors.orange} size={19} />
            <Text style={styles.profileInfoText}>Semestre letivo {profile.semester}</Text>
          </View>
        </>
      )}
    </View>
  );
}

type AgendaPageProps = {
  day: number;
  entries: AgendaEntry[];
  onSelectDay: (day: number) => void;
  onAdd: (entry: Omit<AgendaEntry, 'id'>) => void;
  onRemove: (id: string) => void;
};

function AgendaPage({ day, entries, onSelectDay, onAdd, onRemove }: AgendaPageProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [place, setPlace] = useState('');
  const [category, setCategory] = useState<AgendaCategory>('PESSOAL');
  const selectedDay = weekDays.find((item) => item.day === day) ?? weekDays[0];
  const dayEntries = entries
    .filter((entry) => entry.day === day)
    .sort((first, second) => first.start.localeCompare(second.start));
  const canSave = Boolean(title.trim() && start.trim() && end.trim());

  function saveEntry() {
    if (!canSave) return;
    onAdd({
      day,
      title: title.trim(),
      start: start.trim(),
      end: end.trim(),
      place: place.trim() || 'Sem local definido',
      category,
    });
    setTitle('');
    setStart('');
    setEnd('');
    setPlace('');
    setCategory('PESSOAL');
    setFormOpen(false);
  }

  return (
    <View style={styles.pageContent}>
      <Text style={styles.eyebrow}>SEMANA DE 05 A 11 DE OUTUBRO</Text>
      <Text style={styles.pageTitle}>Sua agenda</Text>
      <Text style={styles.subtitle}>Escolha um dia e organize seus compromissos.</Text>
      <View style={styles.weekStrip}>
        {weekDays.map((weekDay) => {
          const selected = weekDay.day === day;
          const hasEntries = entries.some((entry) => entry.day === weekDay.day);
          return (
            <Pressable
              key={weekDay.day}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${weekDay.fullLabel}, dia ${weekDay.day}`}
              onPress={() => onSelectDay(weekDay.day)}
              style={[styles.dayCell, selected && styles.dayCellActive]}
            >
              <Text style={[styles.dayLabel, selected && styles.dayLabelActive]}>{weekDay.label}</Text>
              <Text style={[styles.dayNumber, selected && styles.dayLabelActive]}>{weekDay.day}</Text>
              {hasEntries && <View style={[styles.dayEntryDot, selected && styles.dayEntryDotActive]} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.agendaDayHeading}>
        <Text style={styles.listHeading}>{selectedDay.fullLabel} · {day} OUT</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFormOpen((isOpen) => !isOpen)}
          style={styles.addAgendaButton}
        >
          {formOpen ? <X color={colors.paper} size={16} /> : <Plus color={colors.paper} size={16} />}
          <Text style={styles.addAgendaButtonLabel}>{formOpen ? 'Fechar' : 'Adicionar'}</Text>
        </Pressable>
      </View>

      {formOpen && (
        <View style={styles.agendaForm}>
          <Text style={styles.formTitle}>Novo compromisso</Text>
          <TextInput
            accessibilityLabel="Nome do compromisso"
            onChangeText={setTitle}
            placeholder="Ex.: Estudar para a prova"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={title}
          />
          <View style={styles.agendaTimeRow}>
            <TextInput
              accessibilityLabel="Horário de início"
              keyboardType="numbers-and-punctuation"
              onChangeText={setStart}
              placeholder="Início · 19:00"
              placeholderTextColor={colors.muted}
              style={[styles.formInput, styles.agendaTimeInput]}
              value={start}
            />
            <TextInput
              accessibilityLabel="Horário de término"
              keyboardType="numbers-and-punctuation"
              onChangeText={setEnd}
              placeholder="Fim · 20:00"
              placeholderTextColor={colors.muted}
              style={[styles.formInput, styles.agendaTimeInput]}
              value={end}
            />
          </View>
          <TextInput
            accessibilityLabel="Local ou observação"
            onChangeText={setPlace}
            placeholder="Local ou observação (opcional)"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={place}
          />
          <View style={styles.categoryPicker}>
            {(['AULA', 'ESTUDO', 'PESSOAL'] as const).map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: category === option }}
                onPress={() => setCategory(option)}
                style={[styles.categoryOption, category === option && styles.categoryOptionActive]}
              >
                <Text style={[styles.categoryOptionLabel, category === option && styles.categoryOptionLabelActive]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={saveEntry}
            style={[styles.saveAgendaButton, !canSave && styles.saveAgendaButtonDisabled]}
          >
            <Text style={styles.saveAgendaButtonLabel}>Salvar na agenda</Text>
          </Pressable>
        </View>
      )}

      {dayEntries.length === 0 ? (
        <View style={styles.emptyAgenda}>
          <CalendarDays color={colors.blue} size={25} />
          <Text style={styles.emptyAgendaTitle}>Dia livre</Text>
          <Text style={styles.emptyAgendaText}>Adicione um compromisso para montar sua agenda.</Text>
        </View>
      ) : (
        dayEntries.map((entry) => (
          <View key={entry.id} style={styles.scheduleCard}>
            <View style={styles.scheduleCopy}>
              <Text style={styles.scheduleTime}>{entry.start} — {entry.end}</Text>
              <Text style={styles.scheduleTitle}>{entry.title}</Text>
              <Text style={styles.scheduleDetail}>{entry.place}</Text>
              <View style={[
                styles.scheduleBadge,
                entry.category === 'ESTUDO' && styles.scheduleBadgeBlue,
                entry.category === 'PESSOAL' && styles.scheduleBadgeGreen,
              ]}>
                <Text style={[
                  styles.scheduleBadgeText,
                  entry.category === 'ESTUDO' && styles.scheduleBadgeBlueText,
                  entry.category === 'PESSOAL' && styles.scheduleBadgeGreenText,
                ]}>{entry.category}</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Excluir ${entry.title}`}
              onPress={() => onRemove(entry.id)}
              style={styles.removeAgendaButton}
            >
              <Trash2 color={colors.muted} size={16} />
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

type NotificationPageProps = {
  notifications: NotificationItem[];
  unreadCount: number;
  onBack: () => void;
  onMarkAllRead: () => void;
  onOpen: (notification: NotificationItem) => void;
};

function NotificationPage({
  notifications,
  unreadCount,
  onBack,
  onMarkAllRead,
  onOpen,
}: NotificationPageProps) {
  return (
    <View style={styles.pageContent}>
      <Pressable accessibilityRole="button" onPress={onBack} style={styles.backAction}>
        <ArrowLeft color={colors.ink} size={17} />
        <Text style={styles.backActionLabel}>Voltar ao início</Text>
      </Pressable>
      <Text style={styles.eyebrow}>CENTRAL DE AVISOS</Text>
      <Text style={styles.pageTitle}>Notificações</Text>
      <Text style={styles.subtitle}>
        {unreadCount > 0
          ? `Você tem ${unreadCount} avisos para conferir.`
          : 'Tudo em dia. Você já conferiu seus avisos.'}
      </Text>

      <View style={styles.notificationToolbar}>
        <Text style={styles.listHeading}>MAIS RECENTES</Text>
        {unreadCount > 0 && (
          <Pressable
            accessibilityRole="button"
            onPress={onMarkAllRead}
            style={styles.markReadAction}
          >
            <CheckCheck color={colors.orange} size={15} />
            <Text style={styles.markReadLabel}>Marcar todas como lidas</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.notificationList}>
        {notifications.map((notification) => (
          <Pressable
            key={notification.id}
            accessibilityRole="button"
            onPress={() => onOpen(notification)}
            style={[styles.notificationRow, !notification.read && styles.notificationUnread]}
          >
            <View style={[
              styles.notificationIcon,
              notification.category === 'aula' && styles.notificationIconBlue,
              notification.category === 'aviso' && styles.notificationIconGreen,
            ]}>
              {notification.category === 'aula' ? (
                <CalendarDays color={colors.ink} size={19} />
              ) : notification.category === 'prazo' ? (
                <Clock3 color={colors.orange} size={19} />
              ) : (
                <BookOpen color={colors.orange} size={19} />
              )}
            </View>
            <View style={styles.notificationCopy}>
              <View style={styles.notificationTitleRow}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                {!notification.read && <View style={styles.unreadIndicator} />}
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
            <ChevronRight color={colors.muted} size={17} />
          </Pressable>
        ))}
      </View>
      <Text style={styles.notificationFootnote}>Avisos do seu espaço acadêmico DIATINF.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  appShell: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    backgroundColor: colors.paper,
  },
  topBar: {
    height: 68,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: colors.ink, fontSize: 18, fontWeight: '800', lineHeight: 20 },
  brandCaption: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 0.7, marginTop: 2 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F2EA',
  },
  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 2,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.orangeBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: { color: colors.paper, fontSize: 9, lineHeight: 12, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 22, paddingTop: 26, paddingBottom: 28, gap: 0 },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 21 },
  eyebrow: { color: colors.orange, fontSize: 10, fontWeight: '800', letterSpacing: 0.75 },
  greeting: { color: colors.ink, fontSize: 27, lineHeight: 34, fontWeight: '800', marginTop: 6 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 3 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.cream, borderWidth: 2, borderColor: '#F1D98C', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  heroCard: {
    minHeight: 214,
    overflow: 'hidden',
    borderRadius: 17,
    backgroundColor: colors.cream,
    paddingHorizontal: 20,
    paddingTop: 19,
    paddingBottom: 15,
    marginBottom: 26,
  },
  heroDecorOne: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#F6D983', right: -34, top: -58, opacity: 0.65 },
  heroDecorTwo: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#F4C96D', right: 27, top: 31, opacity: 0.43 },
  heroCopy: { zIndex: 1 },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#F4D983', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  heroTagText: { color: colors.ink, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  heroTitle: { color: colors.ink, fontSize: 26, lineHeight: 29, fontWeight: '800', marginTop: 13 },
  heroBody: { color: '#52626A', fontSize: 12, lineHeight: 18, marginTop: 7 },
  heroIcon: { position: 'absolute', right: 31, top: 72, width: 70, height: 70, borderRadius: 22, backgroundColor: '#F8E3A3', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '7deg' }] },
  heroFooter: { marginTop: 15, paddingTop: 11, borderTopWidth: 1, borderTopColor: '#EBD696', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  heroFooterText: { color: '#667278', fontSize: 7, fontWeight: '800', letterSpacing: 0.3 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  sectionHint: { color: colors.muted, fontSize: 11, marginTop: 3 },
  textAction: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  textActionLabel: { color: colors.orange, fontSize: 12, fontWeight: '700' },
  classCard: { minHeight: 102, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 12 },
  classTime: { alignItems: 'center', minWidth: 42 },
  classHour: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  classPeriod: { color: colors.orange, fontSize: 8, fontWeight: '800', marginTop: 3, letterSpacing: 0.6 },
  classDivider: { width: 1, height: 51, backgroundColor: colors.line },
  classInfo: { flex: 1 },
  classLabel: { color: colors.orange, fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  className: { color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: '700', marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  locationText: { color: colors.muted, fontSize: 10 },
  taskList: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.paper, marginBottom: 19 },
  taskRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 11, borderBottomWidth: 1, borderBottomColor: colors.line },
  checkbox: { width: 21, height: 21, borderRadius: 7, borderWidth: 1.5, borderColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.green, borderColor: colors.green },
  taskCopy: { flex: 1, gap: 4 },
  taskTitle: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  taskTitleDone: { color: colors.muted, textDecorationLine: 'line-through' },
  taskDetail: { color: colors.muted, fontSize: 10 },
  taskProgressTrack: { height: 7, borderRadius: 4, backgroundColor: '#E8E4D9', overflow: 'hidden', marginTop: 20, marginBottom: 20 },
  taskToolbar: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 19 },
  taskFilters: { flex: 1, minWidth: 0, flexDirection: 'row', gap: 4 },
  taskFilter: { flex: 1, minWidth: 0, minHeight: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F5F2EA', paddingHorizontal: 4 },
  taskFilterActive: { backgroundColor: colors.ink },
  taskFilterLabel: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  taskFilterLabelActive: { color: colors.paper },
  addTaskButton: { minHeight: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 8, backgroundColor: colors.orange, paddingHorizontal: 9 },
  addTaskButtonLabel: { color: colors.paper, fontSize: 10, fontWeight: '800' },
  taskForm: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: '#FBF8F0', padding: 14, marginBottom: 17, gap: 10 },
  taskManagerList: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.paper, marginBottom: 19 },
  taskManagerRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  taskManagerCopy: { flex: 1, minWidth: 0, gap: 4 },
  taskDueDate: { color: colors.orange, fontSize: 9, fontWeight: '700', marginTop: 1 },
  removeTaskButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F5F2EA' },
  quoteStrip: { flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 15 },
  quoteText: { color: colors.muted, fontSize: 11, fontStyle: 'italic' },
  bottomNav: { minHeight: 68, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.paper, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 9, paddingTop: 8, paddingBottom: 3 },
  navItem: { width: 70, alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative' },
  navLabel: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  navLabelActive: { color: colors.orange, fontWeight: '800' },
  navIndicator: { position: 'absolute', top: -9, width: 19, height: 2, backgroundColor: colors.orange, borderRadius: 1 },
  pageContent: { paddingTop: 10, minHeight: 590 },
  pageTitle: { color: colors.ink, fontSize: 30, lineHeight: 38, fontWeight: '800', marginTop: 7 },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 23, marginBottom: 25, gap: 5 },
  dayCell: { flex: 1, minWidth: 0, height: 72, borderRadius: 11, backgroundColor: '#F5F2EA', alignItems: 'center', justifyContent: 'center', gap: 5 },
  dayCellActive: { backgroundColor: colors.ink },
  dayLabel: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  dayLabelActive: { color: colors.paper },
  dayNumber: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  dayEntryDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.orange },
  dayEntryDotActive: { backgroundColor: colors.yellow },
  agendaDayHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  addAgendaButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.orange },
  addAgendaButtonLabel: { color: colors.paper, fontSize: 10, fontWeight: '800' },
  agendaForm: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: '#FBF8F0', padding: 14, marginBottom: 13, gap: 10 },
  formTitle: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 1 },
  formInput: { minHeight: 42, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.paper, color: colors.ink, fontSize: 12, paddingHorizontal: 11, paddingVertical: 9 },
  agendaTimeRow: { flexDirection: 'row', gap: 8 },
  agendaTimeInput: { flex: 1, minWidth: 0 },
  categoryPicker: { flexDirection: 'row', gap: 7 },
  categoryOption: { flex: 1, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 7, backgroundColor: colors.paper },
  categoryOptionActive: { borderColor: colors.ink, backgroundColor: '#E7EEF2' },
  categoryOptionLabel: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  categoryOptionLabelActive: { color: colors.ink },
  saveAgendaButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: colors.ink, marginTop: 2 },
  saveAgendaButtonDisabled: { opacity: 0.45 },
  saveAgendaButtonLabel: { color: colors.paper, fontSize: 12, fontWeight: '800' },
  emptyAgenda: { minHeight: 155, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.blue, borderRadius: 13, padding: 20, marginBottom: 12 },
  emptyAgendaTitle: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 10 },
  emptyAgendaText: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 5 },
  listHeading: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginBottom: 11, marginTop: 5 },
  scheduleCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.paper, padding: 14, marginBottom: 11 },
  scheduleCopy: { flex: 1, minWidth: 0 },
  scheduleTime: { color: colors.orange, fontSize: 10, fontWeight: '800' },
  scheduleTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', marginTop: 7 },
  scheduleDetail: { color: colors.muted, fontSize: 11, marginTop: 5 },
  scheduleBadge: { alignSelf: 'flex-start', backgroundColor: colors.cream, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, marginTop: 13 },
  scheduleBadgeText: { color: colors.orange, fontSize: 8, fontWeight: '800' },
  scheduleBadgeBlue: { backgroundColor: '#E7EEF2' },
  scheduleBadgeBlueText: { color: colors.ink, fontSize: 8, fontWeight: '800' },
  scheduleBadgeGreen: { backgroundColor: '#E7EFE9' },
  scheduleBadgeGreenText: { color: colors.green, fontSize: 8, fontWeight: '800' },
  removeAgendaButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#F5F2EA' },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#E8E4D9', overflow: 'hidden', marginTop: 23, marginBottom: 27 },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.orangeBright },
  tipCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 12, backgroundColor: '#F8F1DF', padding: 15, marginTop: 2 },
  tipText: { color: colors.ink, fontSize: 12, lineHeight: 18, flex: 1 },
  profileCard: { alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 22, marginTop: 24, marginBottom: 16 },
  profileAvatar: { width: 67, height: 67, borderRadius: 34, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F1D98C', marginBottom: 12 },
  profileAvatarText: { color: colors.ink, fontSize: 21, fontWeight: '800' },
  profileName: { color: colors.ink, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  profileHandle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  profileDivider: { height: 1, alignSelf: 'stretch', backgroundColor: colors.line, marginVertical: 17 },
  profileCourse: { color: colors.orange, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },
  profileSchool: { color: colors.muted, fontSize: 11, marginTop: 7, textAlign: 'center' },
  profileInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 15, borderBottomWidth: 1, borderBottomColor: colors.line },
  profileInfoText: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  editProfileButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderWidth: 1, borderColor: colors.orange, borderRadius: 9, marginBottom: 13 },
  editProfileButtonLabel: { color: colors.orange, fontSize: 12, fontWeight: '800' },
  profileEditForm: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: '#FBF8F0', padding: 14, marginTop: 21, gap: 10 },
  profileFormActions: { flexDirection: 'row', gap: 9, marginTop: 2 },
  cancelProfileButton: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.paper },
  cancelProfileButtonLabel: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  saveProfileButton: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8, backgroundColor: colors.ink },
  saveProfileButtonLabel: { color: colors.paper, fontSize: 12, fontWeight: '800' },
  backAction: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginBottom: 25, paddingVertical: 5 },
  backActionLabel: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  notificationToolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 22, marginBottom: 7 },
  markReadAction: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6 },
  markReadLabel: { color: colors.orange, fontSize: 10, fontWeight: '700' },
  notificationList: { borderWidth: 1, borderColor: colors.line, borderRadius: 13, overflow: 'hidden', backgroundColor: colors.paper },
  notificationRow: { minHeight: 108, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  notificationUnread: { backgroundColor: '#FFFBF0' },
  notificationIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F8E8D8', alignItems: 'center', justifyContent: 'center' },
  notificationIconBlue: { backgroundColor: '#E7EEF2' },
  notificationIconGreen: { backgroundColor: '#E7EFE9' },
  notificationCopy: { flex: 1, gap: 4 },
  notificationTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  notificationTitle: { flex: 1, color: colors.ink, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  unreadIndicator: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.orangeBright },
  notificationMessage: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  notificationTime: { color: colors.orange, fontSize: 9, fontWeight: '700', marginTop: 2 },
  notificationFootnote: { color: colors.muted, fontSize: 10, textAlign: 'center', marginTop: 16 },
});
