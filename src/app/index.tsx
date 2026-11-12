import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [todos, setTodos] = useState<
    { id: string; title: string; done: boolean }[]
  >([]);
  const addTodo = () => {
    if (!text.trim()) return;
    if (editingId) {
      setTodos(
        todos.map((t) => (t.id === editingId ? { ...t, title: text } : t)),
      );
      setEditingId(null);
    } else {
      setTodos([
        ...todos,
        { id: Date.now().toString(), title: text, done: false },
      ]);
    }
    setText("");
  };
  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    if (editingId === id) {
      setEditingId(null);
      setText("");
    }
    setTodos(todos.filter((t) => t.id !== id));
  };
  const filteredTodos = todos.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done,
  );
  useEffect(() => {
    AsyncStorage.getItem("todos").then((data) => {
      if (data) setTodos(JSON.parse(data));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem("todos", JSON.stringify(todos));
  }, [todos, loaded]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <Text style={styles.count}>
        {todos.filter((t) => !t.done).length} tugas belum selesai
      </Text>
      <View style={styles.row}>
        <TextInput
          onSubmitEditing={addTodo}
          style={styles.input}
          placeholder="Tulis tugas..."
          value={text}
          onChangeText={setText}
        />
        <Pressable style={styles.button} onPress={addTodo}>
          <Text style={styles.buttonText}>
            {editingId ? "Simpan" : "Tambah"}
          </Text>{" "}
        </Pressable>
      </View>
      <View style={styles.filterRow}>
        {(["all", "active", "done"] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={filter === f && styles.filterTextActive}>
              {f === "all" ? "Semua" : f === "active" ? "Belum" : "Selesai"}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        ListEmptyComponent={<Text style={styles.empty}>Belum ada tugas</Text>}
        data={filteredTodos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Pressable
              style={{ flex: 1 }}
              onLongPress={() => {
                setEditingId(item.id);
                setText(item.title);
              }}
              onPress={() => toggleTodo(item.id)}
            >
              <Text style={[styles.item, item.done && styles.itemDone]}>
                {item.title}
              </Text>
            </Pressable>
            <Pressable onPress={() => deleteTodo(item.id)}>
              <Text style={styles.delete}>Hapus</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  row: { flexDirection: "row", gap: 8, marginVertical: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  item: { paddingVertical: 10, fontSize: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemDone: { textDecorationLine: "line-through", color: "#999" },
  delete: { color: "#dc2626", fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#eee",
  },
  filterBtnActive: { backgroundColor: "#4f46e5" },
  filterTextActive: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#999", marginTop: 24 },
  count: { color: "#666", marginTop: 4 },
});
