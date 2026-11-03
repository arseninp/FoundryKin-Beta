# FoundryKin

Мобильный редактор текстур Minecraft Bedrock: Find, 3D-просмотр, рисование PNG, импорт/экспорт .mcpack.

Приложение: https://arseninp.github.io/FoundryKin-Beta/app.html

## Статус на 2026-11-03

Проверенный HEAD до документации: 40c82f0e6e3be884f73d0ee61bf8a8a385e5164d. Рефакторинг/блоковый этап в целом не завершены; не выпуск/визуальная приёмка. Основной editor не переключён на новый путь, по прежним проверкам legacy UI 0.9.1; HTML здесь заново не проверялся.

Записаны каталог/модели, fruit+stem/budding amethyst/aquatic/propagule/kelp/emissive plants, materials/canvas-GPU lifecycle. Bed/sign/auxiliary/lava cauldron/chest/shulker/banner не нужно повторять. Статуи голема уже используют общие sheets четырёх окислений и четыре статичные позы.

Отдельный read-only preview использует общий FKModelState/FKM/CSS. Eyeblossom — одна card closed/open с glow. Skeleton/wither skeleton/creeper/zombie/piglin/dragon heads находятся в parent cards, source IDs сохранены. Дракон использует textures/entity/dragon/dragon без отдельной PNG головы/полного тела. PNG/form/state/pose независимы.

Срез 27 source block IDs — НЕ 27 cards/весь каталог. Кодовое подключение согласованных голов к preview записано; full compile/реальные PNG-TGA/WebGL/Android/export ещё не приняты. Полные мобы/скелет/развёртки отложены, не текущая недоделка этапа голов. Static states/poses не плеер.

Текущий вопрос владельца — адаптация узкого макета под планшет/компьютер. Предстоит изучить layout и ответить по коду; широкий макет не подтверждён, редизайн/раскладка не согласованы. Последнюю реплику ассистента OLDCHAT19 владелец исключил из работы: она не источник задач/диагнозов.

Порядок: согласованные модели/основа с точечными проверками → совместная приёмка → чистка → удаление заменённой основы после готовности. Workflow/исторические mocks не доказывают успешный CI/render, свежего coverage нет. Возможные проблемы OLDCHAT17 — отдельные исторические гипотезы, не доказанные блокеры.

## Навигация и сохранность

Начать с CONTEXT.md, затем docs/handoff-unified-cards.md; TODO.md/ARCHITECTURE.md/ROADMAP.md/docs/review-principles.md. Прочитаны OLDCHAT19, семь документов, последние 20 коммитов и preview.mjs; HEAD проверен повторно. Тесты/compile/CI/браузер не запускались, весь код/diff не исследовался заново.

Только main, малые пакеты/точное подтверждение каждой записи/полный saved diff. Новые test files отдельно согласовать, существующие не удалять массово. Backup автоматически не обновлять, refactor-0.9 не воссоздавать. LocalStorage fk070_packs не очищать: backup кода не сохраняет паки.

PIN Mojang/bedrock-samples@46ba6ea985fb5a92d79a9419198f10dda14c199d; candidate в репозитории. Legacy Three.js r128/JSZip 3.10.1. Сохранять paper/design tokens/телефонный сценарий.
