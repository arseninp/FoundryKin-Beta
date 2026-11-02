# FoundryKin

Мобильный редактор текстур Minecraft Bedrock: Find, 3D-просмотр, рисование PNG, импорт/экспорт .mcpack.

Приложение: https://arseninp.github.io/FoundryKin-Beta/app.html

## Статус на 2026-11-02

Проверенный кодовый HEAD перед обновлением документов: cc5d4e20ac4ef0ed2c9ab66d955bee8d79154a1c. Это не выпуск приложения. Рефакторинг и блоковый этап не завершены. По прежней проверке основной UI остаётся на legacy fk-модулях 0.9.1; HTML здесь не перечитан. Новый catalog/models ещё не принят в основном редакторе.

После OLDCHAT14 записаны составной preview плодов со стеблями и связи двух соответствующих карточек, optional growth для budding amethyst без объединения карточек, seagrass, mangrove propagule, статический kelp-кандидат, closed eyeblossom→cross и двухслойные open eyeblossom/firefly bush с явной ролью glow.

Последний коммит добавил отдельный models/materials.mjs с role-based материалами и update/dispose. Он ещё НЕ подключён к прочитанному catalog/preview.mjs. Следующая работа — небольшой пакет подключения материалов и lifecycle; затем отдельно одна карточка глазоцвета с выбором «Закрытый / Открытый», сохраняя source IDs/ресурсы/glow. Уже записанные компоненты повторять не нужно.

Новый путь разделяет данные, ownership, aliases/forms/states, исходные ID и построение моделей. Edit PNG не управляет геометрией/стадиями; индексы и повторы сохраняются. Unknown не подменяется кубом. Entities требуют source adapter и отложены; scope до переключения согласовать явно.

Прочитаны OLDCHAT15 целиком и все шесть документов; сверены последние 12 коммитов, текущие preview/forms/materials и полный diff светящихся растений. Тесты в этой передаче не запускались. Ожидаемые 103 library types не означают 103 готовые карточки. Полные validate/tests/compile/CI и PNG/TGA/WebGL/Android/export не подтверждены; свежего coverage нет.

## Навигация и сохранность

Начать с CONTEXT.md, затем TODO.md и ARCHITECTURE.md. План — ROADMAP.md, правила — docs/review-principles.md. Работать в main; refactor-0.9 не воссоздавать. Небольшие самосогласованные пакеты, точное системное подтверждение и полная сверка после записи. Новые постоянные тестовые файлы без отдельного согласования не добавлять; существующие не удалять автоматически.

Backup по прежней проверке 304bc4a автоматически не обновлять. PIN: Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d; candidate в репозитории. Legacy использует Three.js r128 и JSZip 3.10.1. Паки в localStorage fk070_packs; GitHub backup сохраняет код, не паки. Данные сайта ради кэша не очищать.
