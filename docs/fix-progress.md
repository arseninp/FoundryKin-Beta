# Исправления и продолжение по фактическому CI

Обновление 2026-11-17. Этот документ уточняет статус CI; подробная история предыдущих пяти исправлений и ограничений локальных проверок сохранена в версии docs/fix-progress.md на 25e491f663a955e8f9bda63549d51477b98e6067. Контракты CONTEXT/ARCHITECTURE/review-principles и незакрытые задачи audit-handoff сохраняются. Общий UI-рефакторинг не начат.

## Уже записано до этого пакета

- D03: 7826afaa8b4c190e5c31a3257fab20a04df0d728 — поколение polling/отмена таймера в fk-editor.js.
- D01 и связка D03: 2c04c60985b192a9f01f901ea007e808bac1a02e — rollback удаления и отмена при уходе из add.
- D04: 02c00801535d3afae16a630a382cfc1b493db336 — единственный fk-pack-form.mjs, защита чтения значка/формы. 5465765 и c8f4fe7 — пустые повторы с одинаковым содержимым; историю не переписывать.
- D06/U03: 9c07dd19b84d6041d87f3ae387f6c87e53908f53 — валидация сохранённой структуры, unreadable/write guard, storage-first settings.
- 5f5b6dd8d2870f89704c0b28b4a4447987ac979a — только два URL fk-editor.js/fk-app.js в app.html на ?v=0.9.28. app.html blob b2f54c5c46043285fea5bae735faf27ebb8051d1, 13938 bytes. window.FK_V и подписи версий не менялись.

Сохранённые diff сверялись. Исторические временные проверки: D03 9/9; прежняя оболочка 8/8; контроллер формы 18/18; нормализатор 26/26; выделенные storage/settings/startup функции 21/21. Позже полная fk-app.js с настоящими ESM формы/нормализатора прошла 18/18 VM-групп; DOM/storage/FKE/FK/FileReader/backup host были mock. Это не browser/WebGL/Android и не полный CI. Проверенные blobs: fk-app.js dd904460309f63d5d4be8f55663c8a0d61bafc16 (24726 bytes); fk-pack-form.mjs 93a1e2e5fec8dfabb83ea3e377600ea30661a4d7 (3036); fk-pack-data.mjs 23ae9a6c32bb465a73b1e1f158800d64841006d4 (1460). Все <25000 bytes.

Сохранять rollback/draft при отказе записи, storage-first commit и guard для unreadable/неготовых паков, отсутствие автоперезаписи повреждённых записей и блокировку пустого export вместо непрочитанных данных. Нормализатор не проверяет PNG/CRC, внутренний JSON снимков и дубли ID/путей. При отказе import формы/валидатора остаётся inert; retry/recovery не реализован. D02 о вкладках и I01 о конвертации значка в PNG не решены.

## Получены реальные логи CI

Пользователь приложил 0_validate.txt и 1_preview-slice.txt. В обоих checkout = 5f5b6dd8d2870f89704c0b28b4a4447987ac979a. Они заменяют прежний статус неизвестного результата именно для этой ревизии, не для будущего исправленного кода.

validate: 769 tests, pass 754, fail 15, cancelled/skipped/todo 0; exit code 1. Пять падений tools/azalea-preview.test.mjs и семь tools/potted-azalea-preview.test.mjs имеют Azalea models require Three. Ещё три tools/curation.test.mjs: lamp 1 вместо 6, pumpkin 1 вместо 6, repeater/comparator 6 вместо 4. Успешные последующие coverage/upload-artifact не отменяют падение шага тестов.

preview-slice: exit code 1; Banner composition requires instantiateCanvases в catalog/prepared-preview.mjs:57 при вызове plan.instantiate из workflow. Полный CI этой ревизии НЕ зелёный. Это не доказательство регрессии каждого из пяти UI/storage исправлений и не успешная приёмка Pages.

## Этот пакет: только mock двух тестов азалии

В обоих локальных Three mock отсутствует BoxGeometry, обязательный для неизменённых createAzaleaModels/composeShape. Оба старых mock воспроизводят ранний отказ до основных assertions. Подготовлена замена на существующий createThreeMock из tools/three-mock.mjs; его реализация и runtime models не меняются. Тела всех test(...) и assertions в двух файлах оставлены побайтно прежними; новые permanent tests/skip не добавляются.

Исходные blobs: tools/azalea-preview.test.mjs f1df25299eeb8ae9498f26b72da768611dca56da; tools/potted-azalea-preview.test.mjs 5a8feeaaba258378791e7ad8dc506dd106bf5f1a. Подготовленные blobs/размеры: bd6ec31db790d86b66d4a6385c4644ee72297259 / 3759 bytes и 3761f666cf4ffa4a36105eae3f7c75954eb51264 / 6288 bytes. Копии исходных тестов сверены по SHA; новые файлы проверены node --check. Перед этим подтверждением main = 25e491f663a955e8f9bda63549d51477b98e6067, исходные файлы сверены повторно; патч ещё не был записан.

Ранее в текущем продолжении 8/8 временных целевых Node-проверок: оба исходных mock воспроизводят отказ; общий mock проходит неизменённый guard, удаление BoxGeometry снова отвергается; обе обычные азалии сохраняют 7 плоскостей и DoubleSide; обе горшечные 12 групп/36 плоскостей, pot/soil и FrontSide; перебор шести слотов не меняет геометрию/UV/материалы; недостающие роли отклоняются до выделения/добавления геометрии. Использованы полные точные models/azalea.mjs (b5090d9919ea5160c5f321826b733fa26ed64f5d), models/shapes.mjs (7c8430bc20e82d82f6a457e2044a0b3c20d08d10), models/potted-azalea.mjs (9b691a8fbe69f01401d33fc43516fec736311e9d), tools/three-mock.mjs (9a2818ac450cbbad79dcd98885e7e9226f56a026). Это не полный запуск двух постоянных файлов с транзитивным каталогом и не подтверждение 12/12 или всего CI после правки.

## Следом, без нового выбора очереди

После одобренной записи проверить saved diff/content и отсутствие дубля, затем продолжать оставшиеся CI-проблемы.

1. Curation: лампа/тыква построены одним BoxGeometry с шестью material slots; сохранить проверку граней, материалов, powered/variant и независимости PNG вместо изменения геометрии ради Mesh count. Лампа и факел должны проверяться раздельно: факел не заменять ожиданием 1.
2. Repeater/comparator: фильтр только size[1]===2/16 захватывает крышки факелов, не только боковые грани основания. Изолировать основание по размеру/материалу/позиции, не менять вслепую ожидаемое 4 на 6.
3. Preview-slice: баннер направить через настоящий instantiateCanvases и canvas factory с проверяемыми пикселями; не удалять guard, не пропускать баннер и не подменять рабочий renderer. Точная реализация workflow ещё не подготовлена и не одобрена.

Эти три изменения данным пакетом не выполняются. Для правок оставшихся постоянных тестов/workflow требуется отдельное точное системное подтверждение. Нужен свежий полный CI после исправлений; browser/Android/WebGL, реальные import-edit-save-reopen-export/restore/quota и Pages SHA остаются открытыми. Только main, каждый файл <25000 UTF-8 bytes, после записи saved diff/content; не трогать пользовательские данные/кэш, PIN, Three/JSZip и backup/refactor-0.9.
