<?php $__env->startSection('title', 'Manajemen Kendaraan'); ?>

<?php $__env->startSection('content'); ?>
<div class="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
    <h2 class="text-2xl font-bold text-primary">Daftar Kendaraan</h2>

    <div class="flex items-center gap-4 w-full md:w-auto">
        <form action="<?php echo e(route('admin.vehicles')); ?>" method="GET" class="flex-1 md:w-64">
            <div class="relative">
                <input type="text" name="search" value="<?php echo e(request('search')); ?>"
                    class="w-full border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary"
                    placeholder="Cari nama atau plat...">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            </div>
        </form>

        <a href="<?php echo e(route('admin.vehicles.create')); ?>" class="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 whitespace-nowrap">
            <span class="material-symbols-outlined">add</span>
            Tambah Kendaraan
        </a>
    </div>
</div>

<div class="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
    <table class="w-full text-left">
        <thead class="bg-gray-50 border-b border-outline-variant">
            <tr>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">Nama Kendaraan</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase">No. Plat</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase text-center">Kapasitas</th>
                <th class="px-6 py-3 text-sm font-bold text-primary uppercase text-right">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
            <?php $__currentLoopData = $vehicles; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $vehicle): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <p class="font-bold text-primary"><?php echo e($vehicle->name); ?></p>
                </td>
                <td class="px-6 py-4 text-on-surface-variant">
                    <?php echo e($vehicle->license_plate); ?>

                </td>
                <td class="px-6 py-4 text-center">
                    <span class="bg-secondary-container text-secondary px-3 py-1 rounded-full text-xs font-bold"><?php echo e($vehicle->capacity); ?> Kursi</span>
                </td>
                <td class="px-6 py-4 text-right">
                    <a href="<?php echo e(route('admin.vehicles.edit', $vehicle->id)); ?>" class="text-on-surface-variant hover:text-primary mr-3">
                        <span class="material-symbols-outlined">edit</span>
                    </a>
                    <form action="<?php echo e(route('admin.vehicles.delete', $vehicle->id)); ?>" method="POST" class="inline">
                        <?php echo csrf_field(); ?>
                        <?php echo method_field('DELETE'); ?>
                        <button type="submit" class="text-red-500 hover:text-red-700" onclick="return confirm('Hapus kendaraan ini?')">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </form>
                </td>
            </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
    </table>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('admin.layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Program1\Shuttle(local)\shuttle-backend\resources\views/admin/vehicles/index.blade.php ENDPATH**/ ?>